import { json } from '@sveltejs/kit';
import PinataSensitiveService from "$services/sensitive/pinata.sensitive.service";

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    const metadata = await request.json();

    const requiredFields = ['name', 'description', 'link', 'image'];
    for (const field of requiredFields) {
        if (!metadata.hasOwnProperty(field)) {
            return json({ error: `Missing required field: ${field}` }, { status: 400 });
        }
    }

    if(Object.keys(metadata).length !== requiredFields.length) {
        return json({ error: 'Invalid fields' }, { status: 400 });
    }

    if(metadata.name < 3 || metadata.name.length > 32) {
        return json({ error: 'Invalid name' }, { status: 400 });
    }

    if(metadata.description.length > 300) {
        return json({ error: 'Invalid description' }, { status: 400 });
    }

    if(metadata.link.length > 1000) {
        return json({ error: 'Invalid link' }, { status: 400 });
    }

    const MAX_SIZE = 1024 * 512;
    if(metadata.image.length > MAX_SIZE) {
        return json({ error: 'Image too large' }, { status: 400 });
    }

    const ipfs = await PinataSensitiveService.pinJson(metadata);

    return json(ipfs);
}
