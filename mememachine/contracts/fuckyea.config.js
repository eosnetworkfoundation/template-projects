module.exports = {
    networks:{
        jungle: {
            chain: 'Jungle4',
            accounts: [
                {
                    name: process.env.CONTRACT_NAME,
                    private_key: process.env.PRIVATE_KEY
                }
            ]
        },
        eos: {
            chain: 'EOS',
            accounts: [
                {
                    name: process.env.CONTRACT_NAME,
                    private_key: process.env.PRIVATE_KEY
                }
            ]
        }
    },
}
