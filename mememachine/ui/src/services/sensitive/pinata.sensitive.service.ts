import {PINATA_JWT, PINATA_GATEWAY, PINATA_GATEWAY_TOKEN} from '$env/static/private';

import pinataSDK from '@pinata/sdk';
const pinata = new pinataSDK({
    pinataJWTKey: PINATA_JWT,
});

export default class PinataSensitiveService {
    static async pinJson(json: any) {
        const result = await pinata.pinJSONToIPFS(json);
        return result.IpfsHash;
    }

    static async getFile(cid: string) {
        return fetch(`https://${PINATA_GATEWAY}/ipfs/${cid}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`).then(x => x.json());
    }
}
