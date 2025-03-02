import { getSingleOfficeHour, getUserData } from '$lib/firebase/db.js';
import { error } from '@sveltejs/kit';

export async function load({ params, url }) {
	try {
        let data = await getSingleOfficeHour(params.id);
        const hostData = await getUserData(data.host);
        data.host = hostData;
        
        //check for exceptions
        //first by looping through the exceptions array, then by checking the URL
        let exception = url.searchParams.get('exception');
        const today = new Date();
        if (data.exceptions && !exception) {
            for (let e of data.exceptions) {
                let dateChanged = e.dateChanged.toDate();
                let diff = (dateChanged - today) / (1000 * 60 * 60 * 24);
                if (diff < 7 && diff >= 0) {
                    exception = dateChanged;
                    break;
                }
            }
        }

        if (exception) {
            let exceptionDate = new Date(exception);

            for (let e of data.exceptions) {
                console.log(e.dateChanged.toDate().getTime() == exceptionDate.getTime());
                if (e.dateChanged.toDate().getTime() == exceptionDate.getTime()) {
                    data.date = e.date;
                    data.startTime = e.startTime;
                    data.endTime = e.endTime;
                    data.description = e.description;
                    data.location = e.location;
                    data.queueEnabled = e.queueEnabled;
                    data.link = e.link;
                    data.exceptionDate = e.dateChanged.toDate();
                    data.exception = true;
                    break;
                }
            }
        }

        if (!data) {
            throw Error;
        }

        //wrap in IF so we don't hit the try/catch
        if (data.queue) {
            data.queue.forEach((q, idx) => {
                q.position = idx + 1;
            });
        }

        return data;
    }
    catch {
        error(404, "Office hour not found");
    }
}