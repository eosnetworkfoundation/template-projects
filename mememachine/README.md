# Meme Machine!

This is an EOS example project that demonstrates how to use EOS to build smart contracts, and UIs.
In this project we have a simple meme token creator, browser, minter, burner, and transferrer.

> This is a starting point, it will be up to you to take this project and make it your own.

### Tech Stack
- [Fuckyea](https://github.com/nsjames/fuckyea) - Contract Development Framework
- [Wharfkit](https://wharfkit.com/) - Blockchain JavaScript SDK
- [SvelteKit](https://svelte.dev/) - Frontend Web UI Framework
- [ShadCN for Svelte](https://www.shadcn-svelte.com/) - A CSS Component Framework
- [IPFS using Pinata](https://pinata.cloud/) - An IPFS service

### Components
- `/contracts` houses the smart contracts and development framework
- `/ui` houses the frontend

Go ahead and install the dependencies for each component:

```bash
# cd into contracts or ui and then:
npm i
# or
yarn
# or 
bun i
```

## The Contracts


### Understanding the contract

The contract is written as a header and an implementation file. This allows you to easily import the header into
other contracts that you want to use this one in. 

This contract mimics the `eosio.token` contract which is the token standard for EOS and all Antelope chains,
however it adds some minor functionality specific to the memetoken usecase.

Head over to `/contracts/contracts` to read the contract, or `/contracts/tests/` to see what tests are 
available for it. 

### Test the contract

```bash
npx fuckyea test --build
```

### Deploy the contract

I've made this as easy as possible for you.
Copy the `/contracts/.env.example` to `/contracts/` as `.env` and fill out the information there. 

```bash
CONTRACT_NAME= #the account to deploy to
PRIVATE_KEY= #the private key for that account
```

> If you need to create an account you can [go here for the Jungle Testnet](https://monitor.jungletestnet.io/) or
> [here for the EOS Mainnet](https://create.anchor.link/).

If you want to see how the configs are set up, open `/contracts/fuckyea.config.js` and the scripts in `/contracts/deployments/`.

To deploy simply type this command:

```bash
npx fuckyea deploy jungle --build
# or for EOS mainnet
npx fuckyea deploy eos --build
```

This will build the contract in `/contracts/contracts/` and deploy your contract to the network you specified.

> Note that you will also need resources (CPU and NET) as well as RAM to deploy the contract. 

## The UI

The UI is built with SvelteKit, and ready to deploy on [Netlify](https://www.netlify.com/).

### Environment Variables

Copy the `/ui/.env.example` to `/ui/` as `.env` and fill out the information there. 

> You will need to set up a [Pinata account](https://pinata.cloud/) and get your JWT API key and GATEWAY. 

```bash
PINATA_JWT= # the JWT from Pinata
PINATA_GATEWAY= # looks like: holy-hamburger-flap-111.mypinata.cloud
PINATA_GATEWAY_TOKEN= # the token for access to the gateway
PUBLIC_CONTRACT= # the account for the contract
PUBLIC_NETWORK= # the network the contract is deployed to
```

### Running the UI

```bash
npm run dev
# or 
yarn dev
# or (my fav)
bun dev
```

### Deploying the UI

The UI is set up to deploy easily to Netlify. All you need to do is bring it in there, and set the environment variables, and you're good to go.




