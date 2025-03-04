import type { Timestamp } from "firebase/firestore";

export interface UserEntry {
    currentlyQueued: boolean;
    queuedFor: string;
    name: string;
    email: string;
    uid: string;
    photoURL: string;
    officeHours: string[];
    lastLogin: Timestamp;
}