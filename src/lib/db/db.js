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
 * {
 *     "host": "uid",
 *     "course": "course",
 *     "location": "location",
 *     "link": "link",
 *     "date": "date",
 *     "startTime": "timestamp",
 *     "endTime": "timestamp"
 * }
 * 
 * @param {object} data 
 */
export async function uploadNewOfficeHour(data) {
    try {
        const docRef = await addDoc(ohRef, data);
        const userDoc = doc(usersRef, data.host, "officeHours", docRef.id);
        data.officeHoursId = docRef.id;
        await setDoc(userDoc, data);
        return null;
    }
    catch (err) {
        return err;
    }
}


/**
 * Returns data about all office hours
 * 
 * @returns {object} a collection of all office hours
 */
export async function getAllOfficeHours() {
    const querySnapshot = await getDocs(ohRef);
    let oh = [];
    querySnapshot.forEach((doc) => {
        oh.push(doc.data());
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