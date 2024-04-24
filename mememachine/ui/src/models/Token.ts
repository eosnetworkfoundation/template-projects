export interface TokenMetadata {
    name: string;
    description: string;
    link: string;
    image: string; // base64
}

export class Token {
    public ticker: string = "";
    public decimals: number = 0;
    public metadata: string = "";
    public max_supply: string = '0';
    public tokens_per_mint: string = '0';

    public parsedMetadata: TokenMetadata = {
        name: '',
        description: '',
        link: '',
        image: ''
    }

    constructor(json: Partial<Token> = {}) {
        Object.assign(this, json);
        // this.parsedMetadata = JSON.parse(this.metadata);
    }
}
