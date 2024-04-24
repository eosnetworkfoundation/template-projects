import {Token} from "$models/Token";
import BlockchainService from "$services/blockchain.service";
import {Asset} from "@wharfkit/session";
import PinataSensitiveService from "$services/sensitive/pinata.sensitive.service";

export default class BlockchainSensitiveService {
    static async getAllTokens() {
        if(!BlockchainService.session) await BlockchainService.init(false);

        const tokens = await BlockchainService.contract.table("tokens").query().all().then(x => {
            return x.filter(x => x.metadata.startsWith('Qm'));
        });
        if(!tokens) return [];

        let fullTokens = [];
        for(let token of tokens){
            const metadata = await PinataSensitiveService.getFile(token.metadata);
            if(!metadata) continue;
            fullTokens.push(new Token(JSON.parse(JSON.stringify({
                ...token,
                parsedMetadata: metadata,
                // ...stat
            }))));
        }


        return fullTokens;
    }

    static async getFullTokenData(ticker:string) {
        if(!BlockchainService.session) await BlockchainService.init(false);

        const token = await BlockchainService.getTicker(ticker);
        if(!token) return null;
        if(!token.metadata.startsWith('Qm')) return null;
        const metadata = await PinataSensitiveService.getFile(token.metadata);
        const stat = await BlockchainService.getTokenStat(ticker);

        return new Token(JSON.parse(JSON.stringify({
            ...token,
            parsedMetadata: metadata,
            ...stat
        })));
    }
}
