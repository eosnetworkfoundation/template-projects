<script lang="ts">
    import Text from "$components/ui/Text.svelte";
    import {Button} from "$components/ui/button";
    import {Token, type TokenMetadata} from "$models/Token";
    import LocalStorageService from "$services/localstore.service";
    import {onMount} from "svelte";
    import {newmeme, saveNewMeme} from "$stores/newmeme.store";
    import {goto} from "$app/navigation";
    import CreateMemeDisplay from "$components/ui/CreateMemeDisplay.svelte";
    import {humanReadableNumber} from "$utils/numbers";
    import Spinner from "$components/svgs/Spinner.svelte";
    import Checkmark from "$components/svgs/Checkmark.svelte";
    import Alert from "$components/svgs/Alert.svelte";
    import Circle from "$components/svgs/Circle.svelte";
    import BlockchainService, {account} from "$services/blockchain.service";


    onMount(() => {
        const stored = LocalStorageService?.get('newmeme');
        if(stored) {
            newmeme.set(new Token(stored));

            if(
                !$newmeme.parsedMetadata.name.length
                || !$newmeme.parsedMetadata.image.length
            ) {
                return goto('/create');
            }
            if(
                !$newmeme.ticker.length
                || !$newmeme.max_supply
                || !$newmeme.tokens_per_mint
            ) {
                return goto('/create/properties');
            }

        } else {
            goto('/create');
        }
    })

    $: keyvals = [
        $newmeme.ticker ? [ $newmeme.ticker.toUpperCase(), "Ticker"] : [],
        $newmeme.decimals ? [ $newmeme.decimals, "Decimals"] : [],
        $newmeme.max_supply ? [ humanReadableNumber(parseInt($newmeme.max_supply)), "Total supply"] : [],
        $newmeme.tokens_per_mint ? [ humanReadableNumber(parseInt($newmeme.tokens_per_mint)), "Tokens per mint"] : [],
        $newmeme.tokens_per_mint && $newmeme.max_supply ? [ humanReadableNumber(parseInt($newmeme.max_supply) / parseInt($newmeme.tokens_per_mint)), "Total mints possible"] : [],
    ].filter(x => !!x.length);

    enum StepStatus {
        undone,
        doing,
        done,
        error,
    }

    const steps = [
        {
            index: 0,
            text: 'Verifying Meme Quality',
            status: StepStatus.done,
        },
        {
            index: 1,
            text: 'Uploading Meta To IPFS',
            status: StepStatus.undone
        },
        {
            index: 2,
            text: 'Creating Token',
            status: StepStatus.undone
        },
    ]

    $: hasError = steps.some(step => step.status === StepStatus.error);

    let creating = false;

    const createToken = async () => {
        steps.map(x => x.status = StepStatus.undone);

        let errored = false;
        const bail = (step, err) => {
            steps[step].status = StepStatus.error;
            // creating = false;
            console.error(err);
            alert(err);
            errored = true;
        }

        creating = true;

        steps[0].status = StepStatus.doing;
        await new Promise(resolve => setTimeout(resolve, 2000));
        $newmeme.ticker = $newmeme.ticker.trim().toUpperCase();
        saveNewMeme();
        steps[0].status = StepStatus.done;




        steps[1].status = StepStatus.doing;
        $newmeme.metadata = "";
        if(!$newmeme.metadata || !$newmeme.metadata.trim().length) {
            const ipfsCID = await fetch('/api/upload', {
                method: 'POST',
                body: JSON.stringify({
                    name: $newmeme.parsedMetadata.name,
                    description: $newmeme.parsedMetadata.description || '',
                    image: $newmeme.parsedMetadata.image,
                    link: $newmeme.parsedMetadata.link || '',
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json()).catch(err => bail(1, err));
            if (!ipfsCID) {
                bail(1, 'IPFS upload failed');
                return;
            }
            $newmeme.metadata = ipfsCID;
            saveNewMeme();
        }
        steps[1].status = StepStatus.done;
        await new Promise(resolve => setTimeout(resolve, 1000));


        steps[2].status = StepStatus.doing;
        const ticker = $newmeme.ticker.toUpperCase().trim();
        const maximum_supply = `${parseInt($newmeme.max_supply).toFixed($newmeme.decimals)} ${ticker}`;
        const tokens_per_mint = `${parseInt($newmeme.tokens_per_mint).toFixed($newmeme.decimals)} ${ticker}`;

        const result = await BlockchainService.sendTransaction(
            'create',
            {
                creator: $account,
                maximum_supply: maximum_supply,
                tokens_per_mint: tokens_per_mint,
                metadata: $newmeme.metadata,
            }
        );

        if(!result){
            bail(2, 'Transaction failed');
            return;
        }

        steps[2].status = StepStatus.done;
        await new Promise(resolve => setTimeout(resolve, 2000));


        $newmeme = new Token();
        saveNewMeme();

        await goto(`/token/${ticker}`)


    }

</script>


{#if !$account}
    <section class="py-40 flex flex-col justify-center items-center w-full">
        <Text h2 class="text-center">You aren't logged in!</Text>
        <Text class="mt-2" p>Click the connect button on the top right to get started.</Text>
    </section>
{:else}
    {#if creating}
        <section class="fixed left-0 top-0 bottom-0 right-0 w-screen h-screen z-20 flex items-center justify-center">
            <figure class="fixed inset-0 bg-black opacity-80 z-0"></figure>

            <section class="z-10 justify-center items-center">
                <figure class="bg-white p-10 rounded lg:min-w-[500px] max-w-[500px]">
                    <Text h2 class="uppercase italic !font-black">Creating token</Text>

                    <section class="p-3 px-5 mt-5 bg-gray-50 rounded">
                        {#each steps as step}
                            <section class="flex justify-between items-center [&:not(:last-child)]:mb-4 [&:not(:last-child)]:border-b [&:not(:last-child)]:pb-4 [&:first-child]:pt-2 [&:last-child]:pb-2">
                                <Text small>
                                    <b class="font-black uppercase italic">
                                        {step.text}
                                    </b>
                                </Text>
                                <section class="step-icon" class:spinning={step.status === StepStatus.doing}>
                                    {#if step.status === StepStatus.undone}
                                        <Circle />
                                    {:else if step.status === StepStatus.doing}
                                        <Spinner />
                                    {:else if step.status === StepStatus.done}
                                        <Checkmark />
                                    {:else if step.status === StepStatus.error}
                                        <Alert />
                                    {/if}
                                </section>
                            </section>
                        {/each}
                    </section>

                    <Text p class="mt-2 text-xs leading-4 text-black">
                        You will need to sign a transaction with your wallet to create this token. Please review the transaction details before signing.
                    </Text>

                    <section class="p-3 mt-5 bg-red-600 rounded flex justify-center">
                        <Text small class="text-white">
                            DO NOT CLOSE THIS WINDOW/TAB!
                        </Text>
                    </section>

                    {#if hasError}
                        <section class="flex w-full justify-end gap-1">
                            <Button class="mt-5" variant="secondary" on:click={() => creating = false}>Cancel</Button>
                            <Button class="mt-5" on:click={createToken}>Retry</Button>
                        </section>
                    {/if}


                </figure>
            </section>
        </section>
    {/if}

    <CreateMemeDisplay hideTexts />
    <section class="flex-1">
        <Text h1>Review & Create</Text>
        <Text p>
            Make sure everything below is correct, <b class="font-bold">there’s no going back from here</b> 👀
        </Text>

        <figure class="h-[2px] w-full bg-gray-100 my-6"></figure>

        <section>
            <section class="mt-5">
                <Text h2>{$newmeme.parsedMetadata.name}</Text>
                <Text small>{$newmeme.parsedMetadata.description}</Text>
                <Text muted>
                    <u>
                        <a href={$newmeme.parsedMetadata.link} target="_blank">{$newmeme.parsedMetadata.link}</a>
                    </u>
                </Text>
            </section>
            <section class="mt-5 flex flex-wrap gap-10 gap-y-4">
                {#each keyvals as item}
                    <figure class="flex flex-col truncate text-ellipsis">
                        <Text small class="!text-2xl !leading-none !font-black"><b>{item[0]}</b></Text>
                        <Text muted class="text-md italic">{item[1]}</Text>
                    </figure>
                {/each}
            </section>

            <section class="flex justify-end gap-1 mt-20 items-center">
                <Button variant="ghost" href="/create/properties">Back</Button>
                <Button class="px-10 h-auto !py-4" on:click={createToken}>Create 🔥</Button>
            </section>
        </section>


    </section>
{/if}

<style lang="scss">
    .step-icon {
        width: 26px;

        &.spinning {
            animation: spin .4s linear infinite;
        }

        @keyframes spin {
            100% {
                transform: rotate(360deg);
            }
        }
    }
</style>
