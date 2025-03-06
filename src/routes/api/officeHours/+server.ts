import { getAllOfficeHours, getSingleOfficeHour } from '$lib/firebase/db';

export async function GET(params: any): Promise<Response> {
    const searchParams = params.url.searchParams;
    const id = searchParams.get('id');
    
    //user requested an ID, try to fetch a single ofifce hour
    if (id) {
        try {
            const data = await getSingleOfficeHour(id);

            if (!data) {
                throw new Error;
            }
    
            return new Response(JSON.stringify(data), {
                headers: {
                    contentType: "application/json"
                }
            });
        }
        catch {
            return new Response(JSON.stringify({
                "status": `No office hour with id: ${id}`
            }), {
                status: 400,
                statusText: `No office hour with id: ${id}`
            });
        }
    }

    //user did not request ID, send them all office hours
    const data = await getAllOfficeHours();

    return new Response(JSON.stringify(data), {
        headers: {
            contentType: "application/json"
        }
    })
}