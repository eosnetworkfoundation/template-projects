import { Name, Asset, SessionKit, Chains, Session, Transaction, SignedTransaction, Serializer, Action, APIClient, ABI } from "@wharfkit/session"
import { WebRenderer } from "@wharfkit/web-renderer"
import {writable, type Writable} from "svelte/store";
import {TransactPluginResourceProvider} from "@wharfkit/transact-plugin-resource-provider";
import { ContractKit } from "@wharfkit/contract"
import {Token} from "$models/Token";
import {PUBLIC_CONTRACT, PUBLIC_NETWORK} from '$env/static/public';

export let account:Writable<string|null> = writable(null);

const chain = Chains[PUBLIC_NETWORK];
const CONTRACT = PUBLIC_CONTRACT;

export default class BlockchainService {
    public static sessionKit:SessionKit|null = null;
    public static session:Session|null = null;
    public static contractKit:ContractKit|null = null;
    public static apiClient:APIClient|null = null;
    public static contract:any = null;
    private static initialized:boolean = false;

    static async init(wallets:boolean = true) {
        if(wallets){
            const {WalletPluginAnchor} = await import("@wharfkit/wallet-plugin-anchor")
            const {WalletPluginScatter} = await import("@wharfkit/wallet-plugin-scatter")
            const {WalletPluginWombat} = await import("@wharfkit/wallet-plugin-wombat")
            const {WalletPluginTokenPocket} = await import("@wharfkit/wallet-plugin-tokenpocket")
            BlockchainService.sessionKit = new SessionKit({
                appName: "mememachine",
                chains: [
                    chain
                ],
                ui: new WebRenderer(),
                walletPlugins: [
                    new WalletPluginAnchor(),
                    new WalletPluginScatter(),
                    new WalletPluginWombat(),
                    new WalletPluginTokenPocket(),
                ],
            },
            {
                transactPlugins: [new TransactPluginResourceProvider()],
            })

            const session = await BlockchainService.sessionKit.restore()
            if(session) {
                BlockchainService.session = session
                account.set(session.actor.toString())
            }
        }

        if(BlockchainService.initialized) return true;


        BlockchainService.apiClient = new APIClient({
            url: chain.url
        })

        BlockchainService.contractKit = new ContractKit({
            client: BlockchainService.apiClient
        })

        BlockchainService.contract = await BlockchainService.contractKit.load(CONTRACT)

        BlockchainService.initialized = true;
        return true;
    }

    static async login() {
        if(!BlockchainService.sessionKit) await BlockchainService.init();

        BlockchainService.session = (x => x ? x.session : null)(await BlockchainService.sessionKit?.login().catch((err:any) => {
            console.error('login error', err)
            return null;
        }))
        account.set(BlockchainService.session ? BlockchainService.session.actor.toString() : null)
    }

    static async logout() {
        await BlockchainService.sessionKit?.logout()
        account.set(null)
    }

    static async sendTransaction(action:string, data:any) {
        if(!BlockchainService.session) return;

        return await BlockchainService.session.transact({
            actions: [
                {
                    account: CONTRACT,
                    name: action,
                    authorization: [{
                        actor: BlockchainService.session.actor,
                        permission: 'active',
                    }],
                    data: data,
                }
            ]
        }).catch((err:any) => {
            console.error('sendTransaction error', err)
            return null;
        })
    }

    static async mint(times:number, symbol: string, memo:string){
        if(!BlockchainService.session) return;

        let actions = [];
        for(let i = 0; i < times; i++){
            actions.push({
                account: CONTRACT,
                name: 'mint',
                authorization: [{
                    actor: BlockchainService.session.actor,
                    permission: 'active',
                }],
                data: {
                    minter: BlockchainService.session.actor,
                    sym: symbol,
                    memo
                }
            })
        }

        return await BlockchainService.session.transact({ actions }).catch((err:any) => {
            console.error('sendTransaction error', err)
            return null;
        })
    }

    static async getTicker(ticker:string) {
        if(!BlockchainService.initialized) await BlockchainService.init(false);

        return await BlockchainService.contract.table("tokens").get(Name.from(ticker.toLowerCase()).value, {
            key_type: "i64",
            index_position: "2",
        }).then(x => {
            if(!x) return null;
            return JSON.parse(JSON.stringify(x));
        })
    }

    static async getTokenStat(ticker:string) {
        if(!BlockchainService.initialized) await BlockchainService.init(false);

        return await BlockchainService.contract.table("stat").get(ticker.toUpperCase(), {scope: ticker.toUpperCase()}).then(x => {
            if(!x) return null;
            return JSON.parse(JSON.stringify(x));
        })
    }

    static async getTokenBalance(ticker:string, account:string) {
        if(!BlockchainService.initialized) await BlockchainService.init(false);

        const symbol = Asset.Symbol.from(ticker);
        return await BlockchainService.contract.table("accounts").get(symbol.code.value, {scope: account}).then((res:any) => {
            if(!res) return 0;
            return parseFloat(res.balance.toString().split(' ')[0]);
        }).catch((err:any) => {
            console.error('getTokenBalance error', err)
            return 0;
        });
    }

    static async getMetadata(ipfsHash:string) {
        const randomGateway = IPFS_GATEWAYS[Math.floor(Math.random() * IPFS_GATEWAYS.length)];
        return await fetch(`https://${randomGateway}/ipfs/${ipfsHash}`).then(res => res.json());
    }


}

const IPFS_GATEWAYS = [
    'cf-ipfs.com',
    'gateway.ipfs.io',
    'cloudflare-ipfs.com',

]
