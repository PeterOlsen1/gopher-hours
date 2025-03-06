import { getSingleOfficeHour, getUserData } from '$lib/firebase/db.js';
import type { QueueEntry } from '$lib/types/oh.js';
import type { UserEntry } from '$lib/types/user.js';
import { error } from '@sveltejs/kit';
import { Timestamp } from 'firebase/firestore';

export async function load({ params, url }) {
	try {
        let data = await getSingleOfficeHour(params.id) as any;
        const hostData = await getUserData(data.host) as UserEntry;
        data.host = hostData;
        
        //check for exceptions
        //first by looping through the exceptions array, then by checking the URL
        let exception = url.searchParams.get('exception');
        const today = new Date();
        if (data.exceptions && !exception) {
            console.log(data.exceptions);
            for (let e of data.exceptions) {
                let dateChanged = e.weekChanged.toDate();
                let diff = (dateChanged.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
                if (diff < 7 && diff >= 0) {
                    exception = dateChanged;
                    break;
                }
            }
        }

        if (exception) {
            let exceptionDate = new Date(exception);

            for (let e of data.exceptions) {
                if (e.weekChanged.toDate().getTime() == exceptionDate.getTime()) {
                    data.date = e.date;
                    data.startTime = e.startTime;
                    data.endTime = e.endTime;
                    data.description = e.description;
                    data.location = e.location;
                    data.queueEnabled = e.queueEnabled;
                    data.link = e.link;
                    data.exceptionDate = e.weekChanged.toDate();
                    data.exception = true;
                    data.cancelled = e.cancelled;
                    break;
                }
            }
        }

        if (!data) {
            throw Error;
        }

        const blankUser: UserEntry = {
            uid: '',
            name: '',
            email: '',
            photoURL: '',
            currentlyQueued: false,
            queuedFor: '',
            officeHours: [],
            lastLogin: Timestamp.now(),
            queueTime: Timestamp.now(),
            favorites: [],
        }
            
        //wrap in IF so we don't hit the try/catch
        if (data.queue) {
            data.queue.forEach((q: QueueEntry, idx: number) => {
                q.position = idx + 1;
                q.userData = blankUser;
            });
        }

        return data;
    }
    catch {
        error(404, "Office hour not found");
    }
}