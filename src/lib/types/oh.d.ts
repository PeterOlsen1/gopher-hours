import type { Timestamp } from "firebase/firestore";
import type { UserEntry } from "./user";

export interface OfficeHour {
    courseNumber: string;
    date: string;
    department: string;
    description: string;
    endTime: string;
    startTime: string;
    host: string;
    location: string;
    queueEnabled: boolean;
    link: string;
    queue: QueueEntry[];
    color: number[];
    exceptions: Exception[];
    id: String|null;

    /**
     * This will only be set to a date if an exception has been
     * found for the reqeusted office hour 
     */
    exceptionDate: Date|null;

    /**
     * This will only be set to true if an exception has been
     * found for the requested office hour
     */
    exception: boolean|null;
}

export interface Exception {
    /**
     * The week of the exception
     */
    weekChanged: Timestamp;
    date: string;
    startTime: string;
    endTime: string;
    description: string;
    location: string;
    queueEnabled: boolean;
    link: string;
    cancelled: boolean;
    host: string;
}

export interface ChatMessage {
    message: string;
    timestamp: Timestamp;
    uid: string;
    userData: UserEntry|null;
    id: string|null;
}

export interface QueueEntry {
    uid: string;
    position: number;
    queueTime: Timestamp;

    /**
     * Keep userData as null until queue is fetched,
     * this way we can avoid redundant data storage.    
     */
    userData: UserEntry|null;
}