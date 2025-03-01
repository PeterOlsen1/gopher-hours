import { getSingleOfficeHour, getUserDataCache } from '$lib/firebase/db.js';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	try {
        let data = await getSingleOfficeHour(params.id);
        const hostData = await getUserDataCache(data.host);
        data.host = hostData;
        console.log(data);

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