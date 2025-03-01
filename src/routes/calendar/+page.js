import { getAllOfficeHours } from '$lib/firebase/db.js';
import { data } from '$lib/utils/utils'
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    try {
        let temp = await getAllOfficeHours();
        // let temp = data;

        return {officeHours: temp};
    }
    catch {
        error(500, "Calendar could not be loaded");
    }
}