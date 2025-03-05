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
import type { User } from "firebase/auth";
import type { UserEntry } from '../types/user';
import type { Exception, OfficeHour } from '../types/oh';


let db = getFirestore(app);
let usersRef = collection(db, 'users');
let ohRef = collection(db, 'officeHours');

/**
 * Add a new user to the database.
 * Called on every login.
 * 
 * @param {object} userData 
 */
export async function addNewUser(userData: User): Promise<void> {
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
export async function uploadNewOfficeHour(data: OfficeHour): Promise<string> {
    //add a randomly assigned color to the data 
    const color = [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)];
    data.color = color;
    
    //set the office hour document
    const docRef = await addDoc(ohRef, data);

    //update the user's data to include the office hour
    const userDoc = doc(usersRef, data.host);
    const userData = (await getDoc(userDoc)).data();
    if (userData && !userData.officeHours) {
        userData.officeHours = [docRef.id];
    }
    else if (userData) {
        userData.officeHours.push(docRef.id);
    }
    else {
        return "";
    }
    await setDoc(userDoc, userData);

    return docRef.id;
}


/**
 * Returns data about all office hours
 * 
 * @returns {object} a collection of all office hours
 */
export async function getAllOfficeHours(): Promise<OfficeHour[]> {
    const querySnapshot = await getDocs(ohRef);
    let oh: OfficeHour[] = [];
    querySnapshot.forEach(async (doc) => {
        const data = (doc.data()) as OfficeHour;
        data.id = doc.id;
        oh.push(data);
    });
    return oh;
}


/**
 * Get user data according to user id
 * 
 * @param {string} uid 
 * @returns 
 */
export async function getUserData(uid: string): Promise<UserEntry> {
    const docRef = doc(usersRef, uid);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data() as UserEntry;

    return data;
}   

/**
 * Get user data from the cache. Use this when we only want
 * user profile data like name and photo
 * 
 * DO NOT USE THIS ON A PAGE.JS FILE, IT DOES NOT 
 * HAVE ACCESS TO SESSION STORAGE
 * 
 * @param {string} uid 
 * @returns 
 */
export async function getUserDataCache(uid: string): Promise<UserEntry> {
    const cache = JSON.parse(sessionStorage.getItem('userDataCache') || "{}");

    if (cache[uid]) {
        return cache[uid];
    }

    //cache miss, get the data
    const docRef = doc(usersRef, uid);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data() as UserEntry;

    cache[uid] = data;
    sessionStorage.setItem('userDataCache', JSON.stringify(cache));

    return data;
}


/**
 * Get all office hours for a specific user
 * 
 * @param {string} uid optional user id
 * @returns all office hours for a specific user
 */
export async function getTAOfficeHours(uid: string|null=null): Promise<OfficeHour []> {
    if (!uid) {
        await ensureAuth();
        if (!user) {
            return [];
        }
    
        uid = user.uid;
    }

    const allOh = await getAllOfficeHours();
    const oh = allOh.filter(oh => oh.host === uid);

    return oh;
}

/**
 * Deletes the given office hour.
 * 
 * Make sure to ask for conformation before calling this function
 * 
 * @param {string} ohId 
 */
export async function deleteOfficeHour(ohId: string): Promise<void> {
    //ensure user is logged in
    await ensureAuth();
    if (!user) {
        console.log('User is not logged in');
        return;
    }

    let docRef = doc(ohRef, ohId);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data() as OfficeHour;

    if (data.host !== user.uid) {
        console.log('User does not have proper authorization to delete this office hour');
        return;
    }

    await deleteDoc(doc(ohRef, ohId));

    //remove the office hour from the user's data
    docRef = doc(usersRef, user.uid);
    const userData = (await getDoc(docRef)).data() as UserEntry;
    if (userData.officeHours) {
        userData.officeHours = userData.officeHours.filter(oh => oh !== ohId);
    }
    await updateDoc(docRef, userData as any);
}

/**
 * Return data for a single office hour.
 * Mostly to be used within the dynamic route.
 * 
 * @param {string} ohId office hour ID
 * @returns {object} office hour data
 */
export async function getSingleOfficeHour(ohId: string): Promise<OfficeHour> {
    const docRef = doc(ohRef, ohId);
    const docSnap = await getDoc(docRef);
    return docSnap.data() as OfficeHour;
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
export async function updateOfficeHour(ohId: string, data: OfficeHour): Promise<void> {
    await ensureAuth();

    //get real data
    const ohData = await getSingleOfficeHour(ohId);

    //check if we've got the perms
    if (!user || user.uid !== ohData.host) {
        console.log("User does not have proper authorization to update this office hour");
        return;
    }

    //make sure we don't lose these
    data.host = ohData.host;
    data.queue = ohData.queue;

    //write to the office hours reference
    const docRef = doc(ohRef, ohId);
    await updateDoc(docRef, data as any);

    //update the user's data to include the office hour (we never use this. comment it out)
    // const userDoc = doc(usersRef, data.host);
    // const userData = (await getDoc(userDoc)).data() as UserEntry;
    // if (!userData.officeHours) {
    //     userData.officeHours = [ohId];
    // }
    // else if (!userData.officeHours.includes(ohId)) {
    //     userData.officeHours.push(ohId);
    // }
    // updateDoc(userDoc, userData as any);
}

/**
 * Use previous methods to update only the description
 * of a given office hour. Used in the host menu
 * of the office hour page.
 * 
 * @param {string} ohId 
 * @param {string} description 
 */
export async function updateOfficeHourDescription(ohId: string, description: string) {
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
export async function addToQueue(ohId: string, uid: string) {
    const userRef = doc(usersRef, uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data() as UserEntry;
    userData.currentlyQueued = true;
    userData.queuedFor = ohId;
    await updateDoc(userRef, userData as any);

    const docRef = doc(ohRef, ohId);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data() as OfficeHour;
    if (!data.queue) {
        data.queue = [];
    }
    else {
        if (data.queue.includes(uid)) {
            return;
        }
    }

    userData.queueTime = Timestamp.now();
    data.queue.push(uid);
    await updateDoc(docRef, data as any);
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
export async function removeFromQueue(ohId: string, uid: string): Promise<void> {
    const docRef = doc(ohRef, ohId);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data() as OfficeHour;
    if (!data.queue) {
        return;
    }

    data.queue = data.queue.filter(q => q != uid);
    await updateDoc(docRef, data as any);

    const userRef = doc(usersRef, uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data() as UserEntry;
    userData.currentlyQueued = false;
    userData.queuedFor = "";
    await updateDoc(userRef, userData as any);
}

/**
 * Get a listener for the given office hour, and act accordingly 
 * on queue update.
 * 
 * @param {string} ohId given office hour id 
 * @param {function(data): null} callback do stuff with the given office hour data
 * (including the queue)
 * @returns 
 */
export async function getOfficeHourListener(ohId: string, callback: (data: OfficeHour) => void): Promise<() => void> {
    const singleOhRef = doc(ohRef, ohId);

    const unsubscribe = onSnapshot(singleOhRef, (querySnapshot) => {
        callback(querySnapshot.data() as OfficeHour);
    });

    return unsubscribe;
}


/**
 * Update the user data to the given object.
 * 
 * This can be kinda risky, so make sure you only modify a few
 * properties at a time, since we can bascally rewrite the whole
 * user object
 * 
 * @param {string} uid 
 * @param {object} data 
 */
export async function updateUserData(uid: string, data: UserEntry): Promise<void> {
    const docRef = doc(usersRef, uid);
    const docSnap = await getDoc(docRef);
    const userData = docSnap.data();
    await updateDoc(docRef, data as any);
}

/**
 * Add an office hour to the user's favorites.
 * 
 * This will be useful on the calendar when we
 * can show only favorites
 * 
 * @param {string} ohId 
 */
export async function addToFavorites(ohId: string): Promise<void> {
    await ensureAuth();
    if (!user) {
        return;
    }
    const userRef = doc(usersRef, user.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data() as UserEntry;
    if (!userData.favorites) {
        userData.favorites = [ohId];
    }
    else {
        userData.favorites.push(ohId);
    }
    await updateDoc(userRef, userData as any);

    //update cache
    const cache = JSON.parse(sessionStorage.getItem('userDataCache') || "{}");
    cache[user.uid] = userData;
    sessionStorage.setItem('userDataCache', JSON.stringify(cache));
}

/**
 * Remove an office hour from the user's favorites
 * 
 * @param {string} ohId 
 * @returns 
 */
export async function removeFromFavorites(ohId: string): Promise<void> {
    await ensureAuth();
    if (!user) {
        return;
    }

    const userRef = doc(usersRef, user.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data() as UserEntry;
    if (!userData.favorites) {
        return;
    }
    userData.favorites = userData.favorites.filter(f => f !== ohId);
    await updateDoc(userRef, userData as any);

    //update cache
    const cache = JSON.parse(sessionStorage.getItem('userDataCache') || "{}");
    cache[user.uid] = userData;
    sessionStorage.setItem('userDataCache', JSON.stringify(cache));
}

/*
* Get data for the user's favorited office hours.
* Used in the calendar to show only favorited office hours
*/
export async function getFavorites(): Promise<OfficeHour[]> {
    await ensureAuth();
    if (!user) {
        return [];
    }

    const userRef = doc(usersRef, user.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data() as UserEntry;
    if (!userData.favorites) {
        return [];
    }
    
    const ret = [];
    for (let i = 0; i < userData.favorites.length; i++) {
        const oh = await getSingleOfficeHour(userData.favorites[i]);
        ret.push(oh);
    }

    return ret;
}

/**
 * an 'exception' is a case where
 * a TA modifies their office hours for a given
 * week
 * 
 * @param {string} ohId 
 * @param {object} data 
 */
export async function uploadException(ohId: string, data: Exception): Promise<void> {
    const ohData = await getSingleOfficeHour(ohId);

    if (!ohData.exceptions) {
        ohData.exceptions = [data];
    }
    else {
        ohData.exceptions.push(data);
    }

    const ohDocRef = doc(ohRef, ohId);
    await updateDoc(ohDocRef, ohData as any);
}


/**
 * Remove an exception from the given office hours,
 * uniquely identified by the date that it takes
 * place on
 * 
 * @param {string} ohId 
 * @param {Date} exceptionDate 
 */
export async function deleteException(ohId: string, exceptionDate: Timestamp): Promise<void> {
    const ohData = await getSingleOfficeHour(ohId);

    if (!ohData.exceptions) {
        return;
    }

    //define helper function to compare dates (firestore timestamp objects)
    let equalsDate = (e: Exception) => {
        let eDate = e.weekChanged;
        return eDate.nanoseconds == exceptionDate.nanoseconds
                && eDate.seconds == exceptionDate.seconds;
    }

    //update exceptions list
    ohData.exceptions = ohData.exceptions.filter(e => !equalsDate(e));
    const docRef = doc(ohRef, ohId);
    await updateDoc(docRef, ohData as any);
}   