<script lang="ts">
    import { Button } from "$components/ui/button";
    import * as Breadcrumb from "$components/ui/breadcrumb";
    import Text from "$components/ui/Text.svelte";
    import {humanReadableNumber} from "$utils/numbers";
    import * as Tabs from "$components/ui/tabs";
    import * as Card from "$components/ui/card";
    import FieldError from "$components/ui/FieldError.svelte";
    import {Input} from "$components/ui/input";
    import BlockchainService, {account} from "$services/blockchain.service";
    import { toast } from "svelte-sonner";
    import {onMount} from "svelte";

    export let data;
    $:symbol = data.symbol;
    $:image = data.token.parsedMetadata.image;
    $:metadata = data.token.parsedMetadata;
    $: token = data.token;
    $: ticker = token.ticker.split(',')[1];
    $: decimals = token.ticker.split(',')[0];
    $: totalMintsPossible = parseInt(token.max_supply.split(' ')[0]) / parseInt(token.tokens_per_mint.split(' ')[0]);
    $: currentSupply = parseFloat(token.supply.split(' ')[0]);
    $: maxSupply = parseFloat(token.max_supply.split(' ')[0]);
    $: totalMintsLeft = Math.ceil((maxSupply - currentSupply) / parseInt(token.tokens_per_mint.split(' ')[0]));

    $: keyvals = [
        [ ticker.toUpperCase(), "Ticker"],
        [ decimals, "Decimals"],
        [ humanReadableNumber(parseInt(token.max_supply.split(' ')[0])), "Total supply"],
        [ humanReadableNumber(currentSupply), "Current supply"],
        [ humanReadableNumber(parseInt(token.tokens_per_mint.split(' ')[0])), "Tokens per mint"],
        [ humanReadableNumber(parseInt(totalMintsPossible)), "Total mints possible"],
        [ humanReadableNumber(totalMintsLeft), "Mints left"],
        [ token.issuer, 'Creator' ],
    ].filter(x => !!x.length);

    let balance = 0;

    let recipient = '';
    let value = 0;
    let memo = '';
    let mints = 0;
    let working: boolean = false;

    $: humanReadableValue = humanReadableNumber(parseFloat(value));

    $: overdrawnBalance = value > balance;
    $: tooManyMints = mints > totalMintsLeft;
    $: hasTokens = balance > 0;

    let loadingBalance = true;
    const loadTokens = async () => {
        loadingBalance = true;
        BlockchainService.getTokenBalance(token.ticker, $account).then(_balance => {
            balance = _balance;
        });
        loadingBalance = false;
    }
    $: if($account) loadTokens();

    const refetchTokenData = async () => {
        const stat = await BlockchainService.getTokenStat(ticker);
        data.token.tokens_per_mint = stat.tokens_per_mint;
        data.token.supply = stat.supply;
        data.token.max_supply = stat.max_supply;
    }

    const waitForTx = async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const transfer = async () => {
        working = true;
        const result = await BlockchainService.sendTransaction('transfer', {
            from: $account,
            to: recipient,
            quantity: `${parseFloat(value.toString()).toFixed(parseInt(decimals))} ${ticker}`,
            memo
        }).then(async x => {
            toast.success(`Transferred ~${humanReadableNumber(value)} ${ticker} to ${recipient}`);
            value = 0;
            recipient = '';
            memo = '';
            await waitForTx();
            loadTokens();
        }).catch(err => {
            toast.error(err.message);
        })
        working = false;
    }

    const mint = async () => {
        working = true;
        const result = await BlockchainService.mint(
            mints,
            `${decimals},${ticker}`,
            memo
        ).then(async x => {
            toast.success(`Minted ~${humanReadableNumber(parseFloat(token.tokens_per_mint) * mints)} ${ticker} tokens`);
            mints = 0;
            await waitForTx();
            loadTokens();
            refetchTokenData();
        }).catch(err => {
            toast.error(err.message);
        })
        working = false;
    }

    const burn = async () => {
        working = true;
        const result = await BlockchainService.sendTransaction('burn', {
            account: $account,
            quantity: `${parseFloat(value.toString()).toFixed(parseInt(decimals))} ${ticker}`,
        }).then(async x => {
            toast.success(`Burned ~${humanReadableNumber(value)} ${ticker} tokens`);
            value = 0;
            await waitForTx();
            loadTokens();
            refetchTokenData();
        }).catch(err => {
            toast.error(err.message);
        })
        working = false;
    }

    let interval;
    setInterval(() => {
        refetchTokenData();
    }, 10000);


</script>

<svelte:head>
    <title>MemeMachine - {ticker}</title>
    <meta name="description" content="{ticker} - {metadata.description}" />
    <meta property="og:image" content="https://mememachines.netlify.app/ogimage.png">
    <meta property="og:locale" content="en" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="627" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="MemeMachine - {ticker}" />
    <meta property="og:description" content="{ticker} - {metadata.description}" />
    <meta property="og:url" content="https://mememachines.netlify.app" />
    <meta property="og:site_name" content="MemeMachine" />
</svelte:head>


<section class="w-full">
    <Breadcrumb.Root>
        <Breadcrumb.List>
            <Breadcrumb.Item>
                <Breadcrumb.Link href="/">Explore</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
                <Breadcrumb.Link>Tokens</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
                <Breadcrumb.Link class="font-bold">{symbol}</Breadcrumb.Link>
            </Breadcrumb.Item>
        </Breadcrumb.List>
    </Breadcrumb.Root>

    <section class="flex gap-x-10 mt-4 flex-col lg:flex-row">
        <section class="image">
            <img src={image} alt="meme-token" />
        </section>

        <section class="w-full">
            <Text h1>{metadata.name}</Text>
            <Text small>
                <u>
                    <a href={metadata.link} target="_blank" rel="noopener noreferrer">{metadata.link}</a>
                </u>
            </Text>

            <section class="mt-4">
                <Text p>{metadata.description}</Text>
            </section>



            <section class="mt-10 flex flex-wrap gap-16 gap-y-4">
                {#each keyvals as item}
                    <figure class="flex flex-col truncate text-ellipsis">
                        <Text small class="!text-3xl !leading-none !font-black"><b>{item[0]}</b></Text>
                        <Text muted class="text-md italic">{item[1]}</Text>
                    </figure>
                {/each}
            </section>

            <section class="mt-10 w-full">
                <Tabs.Root value={hasTokens ? 'transfer' : 'mint'} class="w-full">
                    <Tabs.List class="w-full flex gap-1">
                        {#if hasTokens}
                            <Tabs.Trigger class="flex-1" value="transfer">Transfer</Tabs.Trigger>
                        {/if}
                        <Tabs.Trigger class="flex-1" value="mint">Mint</Tabs.Trigger>
                        <Tabs.Trigger class="flex-1" value="burn">Burn</Tabs.Trigger>
                    </Tabs.List>


                    <Tabs.Content value="transfer">
                        <Card.Root>
                            <Card.Header>
                                <Text h2>Transfer</Text>
                            </Card.Header>
                            <Card.Content class="flex gap-5 flex-col">
                                <section>
                                    <section class="flex mb-2 justify-between">
                                        <Text small><b>Recipient</b></Text>
<!--                                        <Text small class="{overdrawnBalance ? 'text-red-500' : ''}"><b>{balance}</b></Text>-->
                                    </section>
                                    <Input bind:value={recipient} placeholder="" type="text" />
                                    <!--{#if overdrawnBalance}-->
                                    <!--    <FieldError>You don't have this much</FieldError>-->
                                    <!--{/if}-->
                                </section>

                                <section>
                                    <section class="flex mb-2 justify-between">
                                        <Text small><b>Amount</b></Text>
                                        <Text small class="{overdrawnBalance ? 'text-red-500' : ''}">balance:
                                            {#if loadingBalance}
                                                <b>Loading...</b>
                                            {:else}
                                                <u class="cursor-pointer" on:click={() => value = balance} aria-label="Max">
                                                    <b>{balance}</b>
                                                </u>
                                            {/if}

                                        </Text>
                                    </section>
                                    <section class="relative">
                                        <Input bind:value={value} placeholder="" type="number" />
                                        <figure class="absolute right-2 top-1">
                                            <Text small><b>{humanReadableValue} {ticker}</b></Text>
                                        </figure>
                                    </section>
                                    <Input class="shadow-none" bind:value={value} placeholder="" type="range" max={balance} />
                                    {#if overdrawnBalance}
                                        <FieldError>You don't have this much</FieldError>
                                    {/if}
                                </section>

                                <section>
                                    <section class="flex mb-2 justify-between items-end">
                                        <section class="flex flex-col gap-1">
                                            <Text small><b>Memo</b></Text>
                                            <Text small class="text-xs">
                                                You can add a memo to your transfer. It will be visible to the recipient.
                                            </Text>
                                        </section>
                                        <Text small class="{memo.length >= 256 ? 'text-red-500' : ''}">{memo.length}<b>/256</b></Text>
                                    </section>
                                    <Input bind:value={memo} placeholder="" type="text" />
                                    {#if memo.length >= 256}
                                        <FieldError>Memo is too long</FieldError>
                                    {/if}
                                </section>

                                <Button class="mt-4" disabled={overdrawnBalance || working} on:click={transfer}>Transfer</Button>
                            </Card.Content>
                        </Card.Root>
                    </Tabs.Content>

                    <Tabs.Content value="mint">
                        <Card.Root>
                            <Card.Header>
                                <Text h2>Mint</Text>
                                <Text small>
                                    You will gain {token.tokens_per_mint} ({humanReadableNumber(parseInt(token.tokens_per_mint))}) {ticker} every time you mint.
                                    You can mint as many times as you want as long as there are tokens left.
                                </Text>
                                <Text blockquote class="!mt-4 text-xs">Note: You are limited by transaction execution times.</Text>
                            </Card.Header>
                            <Card.Content class="flex gap-5 flex-col">

                                <section>
                                    <section class="flex mb-2 justify-between">
                                        <Text small><b>How many times?</b></Text>
                                        <Text small class="{tooManyMints ? 'text-red-500' : ''}">mints left:
                                            <b>{totalMintsLeft}</b>
                                        </Text>
                                    </section>
                                    <section class="relative">
                                        <Input bind:value={mints} placeholder="" type="number" />
                                    </section>
                                    <Input class="shadow-none" bind:value={mints} placeholder="" type="range" max={100} />
                                    {#if overdrawnBalance}
                                        <FieldError>You can't mint this many times</FieldError>
                                    {/if}
                                </section>

                                <Button class="mt-4" disabled={overdrawnBalance || working} on:click={mint}>Mint</Button>
                            </Card.Content>
                        </Card.Root>
                    </Tabs.Content>

                    <Tabs.Content value="burn">
                        <Card.Root>
                            <Card.Header>
                                <Text h2>Burn</Text>
                                <Text p>
                                    You're crazy, and I love it.
                                </Text>
                            </Card.Header>
                            <Card.Content class="flex gap-5 flex-col">

                                <section>
                                    <section class="flex mb-2 justify-between">
                                        <Text small><b>Amount</b></Text>
                                        <Text small class="{overdrawnBalance ? 'text-red-500' : ''}">balance:
                                            <u class="cursor-pointer" on:click={() => value = balance} aria-label="Max">
                                                <b>{balance}</b>
                                            </u>
                                        </Text>
                                    </section>
                                    <section class="relative">
                                        <Input bind:value={value} placeholder="" type="number" />
                                        <figure class="absolute right-2 top-1">
                                            <Text small><b>{humanReadableValue} {ticker}</b></Text>
                                        </figure>
                                    </section>
                                    <Input class="shadow-none" bind:value={value} placeholder="" type="range" max={balance} />
                                    {#if overdrawnBalance}
                                        <FieldError>You don't have this much</FieldError>
                                    {/if}
                                </section>

                                <Button class="mt-4" disabled={overdrawnBalance || working} on:click={burn}>Burn</Button>
                            </Card.Content>
                        </Card.Root>
                    </Tabs.Content>



                </Tabs.Root>
            </section>
        </section>
    </section>

</section>

<style lang="scss">
    .image {
        display: flex;
        flex: 0 0 auto;
        justify-content: center;
        max-width: 300px;
        max-height: 300px;

        img {
            max-width: 100%;
            max-height: 100%;
        }

        @media (max-width: 1024px) {
            max-width: 100%;
            max-height: 100%;
            padding-bottom: 20px;
        }
    }

</style>
