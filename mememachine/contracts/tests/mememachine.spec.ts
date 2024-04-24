const { Asset } = require("@greymass/eosio");
const { Blockchain, nameToBigInt, symbolCodeToBigInt, expectToThrow } = require("@proton/vert");
const { assert } = require("chai");
const blockchain = new Blockchain()
// @ts-ignore
const crypto = require('crypto')

// @ts-ignore
const sha256 = (data) => crypto.createHash('sha256').update(data).digest('hex').toString()

// Load contract (use paths relative to the root of the project)
const mememachine = blockchain.createContract('mememachine', 'build/mememachine')
blockchain.createAccounts('creator', 'bob', 'alice')

/* Runs before each test */
beforeEach(async () => {
    // blockchain.resetTables()
})

const sym = symbolCodeToBigInt(Asset.SymbolCode.from('JANK'));

/* Tests */
describe('Meme Machine', () => {
    it('Should be able to create a token', async () => {
        const metadata = {name: 'JANK', symbol: 'JANK', link: 'https://jank.com'};

        const result = await mememachine.actions.create(['creator', '1000000.0000 JANK', '1.0000 JANK', `https://eosdata.com/${sha256(JSON.stringify(metadata))}`]).send('creator@active')
        const row = mememachine.tables.stat(sym).getTableRow(sym);
        assert(!!row, "Token not found")

        assert.equal(row.max_supply, '1000000.0000 JANK', 'Max Supply is incorrect')
        assert.equal(row.supply, '0.0000 JANK', 'Supply is incorrect')
        assert.equal(row.issuer, 'creator', 'Issuer is incorrect')
        assert.equal(row.tokens_per_mint, '1.0000 JANK', 'Tokens per mint is incorrect')

        const tokenRow = mememachine.tables.tokens(nameToBigInt('mememachine')).getTableRows(sym);
        assert(tokenRow.length === 1, "Tokens row not found")
        assert.equal(tokenRow[0].metadata, `https://eosdata.com/${sha256(JSON.stringify(metadata))}`, 'URI is incorrect')
        assert.equal(tokenRow[0].ticker, '4,JANK', 'Symbol is incorrect')
    });

    it('Should not be able to re-create a token', async () => {
        const metadata = {name: 'JANK', symbol: 'JANK', link: 'https://jank.com'};

        await expectToThrow(
            mememachine.actions.create(['creator', '1000000.0000 JANK', '1.0000 JANK', `https://eosdata.com/${sha256(JSON.stringify(metadata))}`]).send('creator@active'),
            'eosio_assert: token with symbol already exists'
        )
    });

    it('Should be able to mint tokens', async () => {
        const result = await mememachine.actions.mint(['bob', '4,JANK', '']).send('bob@active')
        const row = mememachine.tables.accounts(nameToBigInt('bob')).getTableRow(sym);
        assert(!!row, "Token balance not found")
        assert.equal(row.balance, '1.0000 JANK', 'Balance is incorrect')

        for (let i = 0; i < 10; i++) {
            await mememachine.actions.mint(['bob', '4,JANK', '']).send('bob@active')
        }

        const newRow = mememachine.tables.accounts(nameToBigInt('bob')).getTableRow(sym);
        assert.equal(newRow.balance, '11.0000 JANK', 'Balance is incorrect')
    });

    it('Should be able to burn tokens', async () => {
        const result = await mememachine.actions.burn(['bob', '1.0000 JANK']).send('bob@active')
        const row = mememachine.tables.accounts(nameToBigInt('bob')).getTableRow(sym);
        assert(!!row, "Token balance not found")
        assert.equal(row.balance, '10.0000 JANK', 'Balance is incorrect')

        const statRow = mememachine.tables.stat(sym).getTableRow(sym);
        assert.equal(statRow.supply, '10.0000 JANK', 'Supply is incorrect')
        assert.equal(statRow.max_supply, '999999.0000 JANK', 'Max Supply is incorrect')
    });
});
