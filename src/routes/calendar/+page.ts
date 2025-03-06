import { getAllOfficeHours } from '$lib/firebase/db.js';
import { data } from '$lib/utils/utils'
import { error } from '@sveltejs/kit';
import type OfficeHour from '$lib/components/OfficeHour.svelte';

export async function load({ params }): Promise<{officeHours: OfficeHour[]}> {
    try {
        let temp = await getAllOfficeHours() as OfficeHour[];
        // let temp = data;

        return {officeHours: temp};
    }
    catch {
        error(500, "Calendar could not be loaded");
    }
}