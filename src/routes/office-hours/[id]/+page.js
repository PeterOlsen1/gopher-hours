import { getSingleOfficeHour } from '$lib/firebase/db.js';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	try {
        let data = await getSingleOfficeHour(params.id);
        if (!data) {
            throw Error;
        }

        data.queue.forEach((q, idx) => {
            q.position = idx + 1;
        });

        return data;
    }
    catch {
        error(404, "Office hour not found");
    }
}