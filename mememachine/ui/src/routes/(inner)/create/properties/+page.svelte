<script lang="ts">
    import Text from "$components/ui/Text.svelte";
    import {Input} from "$components/ui/input";
    import {Textarea} from "$components/ui/textarea";
    import ImageBox from "$components/ui/ImageBox.svelte";
    import FieldError from "$components/ui/FieldError.svelte";
    import {Button} from "$components/ui/button";
    import {Token, type TokenMetadata} from "$models/Token";
    import LocalStorageService from "$services/localstore.service";
    import {onMount} from "svelte";
    import {newmeme, saveNewMeme} from "$stores/newmeme.store";
    import {goto} from "$app/navigation";
    import CreateMemeDisplay from "$components/ui/CreateMemeDisplay.svelte";
    import {humanReadableNumber} from "$utils/numbers";
    import BlockchainService, {account} from "$services/blockchain.service";

    const MAX_TICKER_LENGTH = 7;
    const MAX_DECIMALS = 8;
    const MAX_MAX_SUPPLY = 10000000000;
    $: tickerTooLong = $newmeme.ticker.length > MAX_TICKER_LENGTH;
    $: tooManyDecimals = parseInt($newmeme.decimals.toString()) > MAX_DECIMALS;
    $: tooManyMaxSupply = parseInt($newmeme.max_supply) > MAX_MAX_SUPPLY;

    $: humanReadableMaxSupply = humanReadableNumber(parseInt($newmeme.max_supply));
    $: humanReadablePerMint = humanReadableNumber(parseInt($newmeme.tokens_per_mint));

    let tickerTaken:boolean = false;
    let debounce:any = null;
    const checkTicker = async () => {
        clearTimeout(debounce);
        debounce = setTimeout(async () => {
            if($newmeme.ticker.length > 0) {
                const taken = await BlockchainService.getTicker($newmeme.ticker);
                tickerTaken = !!taken;
                saveNewMeme();
            }
        }, 1000);
    }

    const submit = async () => {
        if(!$newmeme.ticker || tickerTaken) return document.getElementById('ticker').focus();
        if(parseInt($newmeme.max_supply) <= 0) return document.getElementById('max_supply').focus();
        if(parseInt($newmeme.tokens_per_mint) <= 0) return document.getElementById('tokens_per_mint').focus();
        if(tickerTooLong || tooManyDecimals || tooManyMaxSupply) {
            return;
        }

        // TODO: Check if ticker exists here

        saveNewMeme();

        await goto('/create/review');
    }

    const realignPerMint = () => {
        if(parseInt($newmeme.tokens_per_mint) > parseInt($newmeme.max_supply)) {
            $newmeme.tokens_per_mint = $newmeme.max_supply;
        }
        saveNewMeme();
    }

    onMount(() => {
        const stored = LocalStorageService?.get('newmeme');
        if(stored) {
            newmeme.set(new Token(stored));

            if(
                !$newmeme.parsedMetadata.name.length
                || !$newmeme.parsedMetadata.image.length
            ) {
                goto('/create');
            }


            if($newmeme.ticker.length > 0) {
                checkTicker();
            }
        } else {
            goto('/create');
        }
    })

</script>



{#if !$account}
    <section class="py-40 flex flex-col justify-center items-center w-full">
        <Text h2 class="text-center">You aren't logged in!</Text>
        <Text class="mt-2" p>Click the connect button on the top right to get started.</Text>
    </section>
{:else}
    <CreateMemeDisplay />
    <section class="flex-1">
        <Text h1>Set the properties</Text>
        <Text p>Meme tokens are silly tokens that only exist for the meme culture.</Text>

        <section class="flex flex-col gap-8 mt-8">

            <section>
                <section class="flex mb-2 justify-between">
                    <Text small><b>Ticker</b></Text>
                    <Text small class="{tickerTooLong ? 'text-red-500' : ''}">{$newmeme.ticker.length}<b>/{MAX_TICKER_LENGTH}</b></Text>
                </section>
                <Input id="ticker" on:input={checkTicker} bind:value={$newmeme.ticker} placeholder="BOB" />
                {#if tickerTooLong}
                    <FieldError>Ticker is too long</FieldError>
                {/if}
                {#if tickerTaken}
                    <FieldError>This ticker already exists</FieldError>
                {/if}
            </section>

            <section>
                <section class="flex mb-2 justify-between">
                    <Text small><b>Decimals</b></Text>
                    <Text small class="{tooManyDecimals ? 'text-red-500' : ''}">max: <b>{MAX_DECIMALS}</b></Text>
                </section>
                <Input on:input={saveNewMeme} bind:value={$newmeme.decimals} placeholder="" type="number" />
                {#if tooManyDecimals}
                    <FieldError>Too many decimals</FieldError>
                {/if}
            </section>

            <section>
                <section class="flex mb-2 justify-between">
                    <Text small><b>Maximum Supply</b></Text>
                    <Text small class="{tooManyDecimals ? 'text-red-500' : ''}">max: <b>{humanReadableNumber(MAX_MAX_SUPPLY)}</b></Text>
                </section>
                <section class="relative">
                    <Input id="max_supply" on:input={realignPerMint} bind:value={$newmeme.max_supply} placeholder="" type="number" />
                    <figure class="absolute right-2 top-1">
                        <Text small><b>{humanReadableMaxSupply}</b></Text>
                    </figure>
                </section>
                <Input class="shadow-none" on:input={realignPerMint} bind:value={$newmeme.max_supply} placeholder="" type="range" max={MAX_MAX_SUPPLY} step="1000000" />
                {#if tooManyMaxSupply}
                    <FieldError>Your maximum supply is too high</FieldError>
                {/if}
            </section>

            <section>
                <section class="flex mb-2 justify-between items-end">
                    <section class="flex flex-col gap-1">
                        <Text small><b>Tokens Given Per Mint</b></Text>
                        <Text small class="text-xs max-w-xl">
                            Every account that mints this token (1 transaction) will get this many tokens. Keep in mind that any account can mint as many times as they want.
                        </Text>
                    </section>
                </section>
                <section class="relative">
                    <Input id="tokens_per_mint" on:input={saveNewMeme} bind:value={$newmeme.tokens_per_mint} placeholder="" type="number" />
                    <figure class="absolute right-2 top-1">
                        <Text small><b>{humanReadablePerMint}</b></Text>
                    </figure>
                </section>
                <Input class="shadow-none" on:input={saveNewMeme} bind:value={$newmeme.tokens_per_mint} placeholder="" type="range" max={$newmeme.max_supply} />
                {#if tooManyDecimals}
                    <FieldError>Too many decimals</FieldError>
                {/if}
            </section>


            <section class="flex justify-end gap-1">
                <Button variant="ghost" href="/create">Back</Button>
                <Button on:click={submit}>Continue</Button>
            </section>
        </section>


    </section>
{/if}
