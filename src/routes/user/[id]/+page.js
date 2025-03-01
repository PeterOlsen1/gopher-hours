import { getTAOfficeHours, getUserDataCache } from '$lib/firebase/db';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	try {
        let data = await getUserDataCache(params.id);
        
        if (!Object.keys(data).length) {
            throw Error;
        }

        let oh = await getTAOfficeHours(params.id);
        data.officeHours = oh;

        return data;
    }
    catch {
        error(404, "User");
    }
}