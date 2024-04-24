import { json } from '@sveltejs/kit';
import BlockchainSensitiveService from "$services/sensitive/blockchain.sensitive.service";

/** @type {import('./$types').RequestHandler} */
export async function GET({ request, params }) {
    const token = await BlockchainSensitiveService.getFullTokenData(params.symbol);
    return json(token);
}
