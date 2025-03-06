import { getUserData } from '$lib/firebase/db';

export async function GET(params: any): Promise<Response> {
    const searchParams = params.url.searchParams;
    const id = searchParams.get('id');

    //no id given
    if (!id) {
        return new Response(JSON.stringify({
            "status": `No id provided!`
        }), {
            status: 400,
            statusText: `No id provided!`
        });
    }

    const userData = await getUserData(id);

    //check if the data is valid or not
    if (!userData) {
        return new Response(JSON.stringify({
            "status": `No user with id: ${id}`
        }), {
            status: 400,
            statusText: `No user with id: ${id}`
        });
    }
    else {
        return new Response(JSON.stringify(userData), {
            headers: {
                contentType: "application/json"
            }
        });
    }
}