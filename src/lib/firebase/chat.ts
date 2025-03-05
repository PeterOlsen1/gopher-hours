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
import { getUserDataCache } from './db';
import type { User } from 'firebase/auth';
import type { ChatMessage } from '../types/oh';


let db = getFirestore(app);
let ohRef = collection(db, 'officeHours');


/**
 * Add new message to the chat
 * 
 * @param {string} ohId office hours id to chat in
 * @param {object} userData (firebase user object) 
 * @param {string} message chat message
 */
export async function addNewChatMessage(ohId: string, user: User, message: string): Promise<string> {
    const chatRef = collection(ohRef, ohId, 'chat');
    const data = {
        message: message,
        timestamp: Timestamp.now(),
        uid: user.uid,
    }
    const docRef = await addDoc(chatRef, data);
    return docRef.id;
}

/**
 * 
 * @param {string} ohId string
 * @param {function(object[]): void} callback function to be called with the chat messages
 * @returns {function(): void} unsubscribe function
 */
export async function getChatListener(ohId: string, callback: (messages: ChatMessage[]) => void): Promise<() => void> {
    const chatRef = collection(ohRef, ohId, 'chat');
    const now = Timestamp.now();
    const secondsInADay = 60 * 60 * 24;

    const unsubscribe = onSnapshot(chatRef, async (querySnapshot) => {
        let messages = [];
        for (let doc of querySnapshot.docs) {
            //delete if older than a day
            if (doc.data().timestamp.seconds < now.seconds - secondsInADay) {
                deleteDoc(doc.ref);
                return;
            }
            const data = doc.data() as ChatMessage;

            //append user data to the returning data
            const uid = data.uid;
            const userData = await getUserDataCache(uid);
            data.userData = userData;

            data.id = doc.id;
            messages.push(data);
        }

        callback(messages);
    });

    return unsubscribe;
}
