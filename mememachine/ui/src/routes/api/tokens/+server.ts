import { json } from '@sveltejs/kit';
import BlockchainSensitiveService from "$services/sensitive/blockchain.sensitive.service";

/** @type {import('./$types').RequestHandler} */
export async function GET({ request }) {
    const tokens = await BlockchainSensitiveService.getAllTokens();
    return json(tokens);
}
