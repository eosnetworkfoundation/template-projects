import { error, redirect } from '@sveltejs/kit';
import BlockchainService from "$services/blockchain.service";

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params }) {
    const token = await fetch(`/api/token/${params.symbol.toUpperCase()}`).then(x => x.json()).catch(err => {
        console.error('error', err);
        return null;
    });

    if(!token) {
        redirect(302, '/');
    }

    return {
        token,
        symbol: params.symbol.toUpperCase()
    };
}
