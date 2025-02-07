import {
    getFirestore,
    collection,
    doc,
    getDoc,
    setDoc,
    addDoc,
    getDocs,
    deleteDoc,
    Timestamp,
    updateDoc,
    onSnapshot,
} from 'firebase/firestore';
import { app } from './firebase';
import { ensureAuth, user } from './auth';


let db = getFirestore(app);
let usersRef = collection(db, 'users');
let ohRef = collection(db, 'officeHours');

/**
 * Add a new user to the database.
 * Called on every login.
 * 
 * @param {object} userData 
 */
export async function addNewUser(userData) {
    const docRef = doc(usersRef, userData.uid);
    const docSnap = await getDoc(docRef);
    const exists = docSnap.exists();

    //if any information has changed, update it
    if (exists) {
        let data = docSnap.data();

        if (data.name === userData.providerData[0].displayName) {
            data.name = userData.providerData[0].displayName;
        }
        if (data.email === userData.providerData[0].email) {
            data.email = userData.providerData[0].email;
        }
        if (data.photoURL === userData.providerData[0].photoURL) {
            data.photoURL = userData.providerData[0].photoURL;
        }
        
        data.lastLogin = Timestamp.now();

        await updateDoc(docRef, data);
        return;
    }

    //new user, initialize their data
    let data = {
        name: userData.providerData[0].displayName,
        email: userData.providerData[0].email,
        photoURL: userData.providerData[0].photoURL,
        uid: userData.uid,
        lastLogin: Timestamp.now(),
    }

    await setDoc(docRef, data);
}

/**
 * Upload new office hour to the database.
 * Data will look as follows:
 * 
    {
        "endTime": "14:00",
        "host": {
            "uid": "snVS969S9Uh6rgTRGsm8KiwivQr1",
            "name": "Peter Olsen",
            "email": "olse0321@umn.edu",
            "photoURL": "https://lh3.googleusercontent.com/a/ACg8ocIuL83tINGEnJFzMrilbAe4pENc4c7Nu0Ki5y04i70g6dONNIg=s96-c",
            "lastLogin": {
                "seconds": 1738284498,
                "nanoseconds": 699000000
            }
        },
        "date": "wednesday",
        "startTime": "12:00",
        "location": "Lind L103",
        "link": "",
        "course": "CSCI 4131"
    }
 * 
 * @param {object} data 
 */
export async function uploadNewOfficeHour(data) {
    //grab host data to store in office hour object
    const hostData = await getUserData(data.host);
    data.host = hostData;

    //set the office hour document
    const docRef = await addDoc(ohRef, data);

    //update the user's data to include the office hour
    const userDoc = doc(usersRef, data.host.uid, "officeHours", docRef.id);
    data.officeHoursId = docRef.id;
    await setDoc(userDoc, data);
}


/**
 * Returns data about all office hours
 * 
 * @returns {object} a collection of all office hours
 */
export async function getAllOfficeHours() {
    const querySnapshot = await getDocs(ohRef);
    let oh = [];
    querySnapshot.forEach(async (doc) => {
        const data = doc.data();
        data.id = doc.id;
        oh.push(data);
    });
    return oh;
}


/**
 * Retrieve all office hours according to course query
 * 
 * Use this to find either department or course number
 * 
 * @param {number | string} course Course query
 * @returns A list of all office hours containing the course query
 */
export async function getOfficeHoursByClassQuery(query) {
    const allData = await getAllOfficeHours();
    const filteredData = allData.filter(oh => oh.toLowerCase().course.includes(query.toLowerCase()));
    return filteredData;
}


/**
 * Get user data according to user id
 * 
 * @param {string} uid 
 * @returns 
 */
export async function getUserData(uid) {
    const docRef = doc(usersRef, uid);
    const docSnap = await getDoc(docRef);
    return docSnap.data();
}


/**
 * Get all office hours for a specific user
 * 
 * @param {string} uid optional user id
 * @returns all office hours for a specific user
 */
export async function getTAOfficeHours(uid=null) {
    if (!uid) {
        await ensureAuth();
        if (!user) {
            return [];
        }
    
        uid = user.uid;
    }

    const collectionRef = await collection(usersRef, uid, "officeHours");
    const querySnapshot = await getDocs(collectionRef);
    let oh = [];
    querySnapshot.forEach(async (doc) => {
        const data = doc.data();
        data.id = doc.id;
        oh.push(data);
    });

    return oh;
}

/**
 * Deletes the given office hour.
 * 
 * Make sure to ask for conformation before calling this function
 * 
 * @param {string} ohId 
 */
export async function deleteOfficeHour(ohId) {
    await ensureAuth();
    let docRef = doc(ohRef, ohId);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data();
    if (data.host.uid !== user.uid) {
        return;
    }

    await deleteDoc(doc(ohRef, ohId));

    //remove the office hour from the user's data
    docRef = doc(usersRef, user.uid, "officeHours", ohId);
    await deleteDoc(docRef);
}

/**
 * Return data for a single office hour.
 * Mostly to be used within the dynamic route.
 * 
 * @param {string} ohId office hour ID
 * @returns {object} office hour data
 */
export async function getSingleOfficeHour(ohId) {
    const docRef = doc(ohRef, ohId);
    const docSnap = await getDoc(docRef);
    return docSnap.data();
}

/**
 * Update the given office hour with the new data.
 * 
 * Udpates both the office hour reference and the one on the
 * user's proifile
 * 
 * @param {string} ohId 
 * @param {object} data 
 * @returns 
 */
export async function updateOfficeHour(ohId, data) {
    await ensureAuth();

    //get real data
    const ohData = await getSingleOfficeHour(ohId);

    //check if we've got the perms
    if (!user || user.uid !== ohData.host.uid) {
        console.log("User does not have proper authorization to update this office hour");
        return;
    }

    //make sure we don't lose these
    data.host = ohData.host;
    data.queue = ohData.queue;

    //write to the office hours reference
    const docRef = doc(ohRef, ohId);
    await updateDoc(docRef, data);

    //update the user's data to include the office hour
    const userDoc = doc(usersRef, data.host.uid, "officeHours", ohId);
    const docSnap = await getDoc(userDoc);
    if (!docSnap.exists()) {
        setDoc(userDoc, data);
    }
    else {
        updateDoc(userDoc, data);
    }
}

/**
 * Use previous methods to update only the description
 * of a given office hour. Used in the host menu
 * of the office hour page.
 * 
 * @param {string} ohId 
 * @param {string} description 
 */
export async function updateOfficeHourDescription(ohId, description) {
    const ohData = await getSingleOfficeHour(ohId);
    ohData.description = description;
    updateOfficeHour(ohId, ohData);
}

/**
 * Add the given user to the queue of
 * the given office hour.
 * 
 * Will not add the same student twice
 * 
 * Mark their profile as currentlyQueued
 * 
 * @param {string} ohId 
 * @param {string} uid 
 * @returns 
 */
export async function addToQueue(ohId, uid) {
    const userRef = doc(usersRef, uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    userData.currentlyQueued = true;
    userData.queuedFor = ohId;
    await updateDoc(userRef, userData);

    const docRef = doc(ohRef, ohId);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data();
    if (!data.queue) {
        data.queue = [];
    }
    else {
        if (data.queue.includes(uid)) {
            return;
        }
    }

    userData.queueTime = Timestamp.now();
    data.queue.push(userData);
    await updateDoc(docRef, data);
}

/**
 * Remove the given user from the given 
 * office hour's queue.
 * 
 * Update their profile to reflect that they
 * are not queueing anymore
 * 
 * @param {string} ohId 
 * @param {string} uid 
 * @returns 
 */
export async function removeFromQueue(ohId, uid) {
    const docRef = doc(ohRef, ohId);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data();
    if (!data.queue) {
        return;
    }

    data.queue = data.queue.filter(q => q.uid != uid);
    await updateDoc(docRef, data);

    const userRef = doc(usersRef, uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    userData.currentlyQueued = false;
    userData.queuedFor = "";
    await updateDoc(userRef, userData);
}

/**
 * Get a queue listener for the given office hour, and act accordingly 
 * on queue update.
 * 
 * @param {string} ohId given office hour id 
 * @param {function(data): null} callback do stuff with the given office hour data
 * (including the queue)
 * @returns 
 */
export async function getQueueListener(ohId, callback) {
    const singleOhRef = doc(ohRef, ohId);

    const unsubscribe = onSnapshot(singleOhRef, (querySnapshot) => {
        callback(querySnapshot.data());
    });

    return unsubscribe;
}