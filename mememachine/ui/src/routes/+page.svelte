<script lang="ts" xmlns="http://www.w3.org/1999/html">
    import { Button } from "$components/ui/button";
    import {onMount} from "svelte";
    import BlockchainService from "$services/blockchain.service";
    import type {Token} from "$models/Token";
    import Text from "$components/ui/Text.svelte";
    import { Badge } from "$components/ui/badge";
    import { Skeleton } from "$components/ui/skeleton";

    // export let data;

    let loading = true;
    let tokens = [];

    onMount(async () => {
        const _tokens = await fetch('/api/tokens').then(res => res.json());
        tokens = _tokens;
        loading = false;
    });
    $: featured = tokens[Math.floor(Math.random() * tokens.length)];

    // $: tokens = data.tokens;
    // $: featured = tokens[Math.floor(Math.random() * tokens.length)];
</script>

{#if loading}

    <section class="w-full relative flex min-h-[600px] py-30 px-10">
        <section class="max-w-[1280px] mx-auto mt-10 flex gap-10 w-full h-full items-center flex-col-reverse lg:flex-row">

            <section class="details flex-1 w-full">
                <Skeleton class="h-[20px] w-[80px] rounded-full" />
                <Skeleton class="mt-2 h-[30px] w-[200px] rounded-full" />
                <Skeleton class="mt-2 lg:max-w-[500px] h-[40px] w-[400px] rounded-full" />
<!--                <Text h2 class="mt-2 truncate">{featured.parsedMetadata.name}</Text>-->
<!--                <Text p class="mt-2 lg:max-w-[500px]">{featured.parsedMetadata.description}</Text>-->

                <section class="mt-10">
<!--                    <Button href="/token/{featured.ticker.split(',')[1]}">Go to <b class="ml-1">{featured.ticker.split(',')[1]}</b></Button>-->
                    <Skeleton class="h-[40px] w-[200px] rounded-full" />
                </section>
            </section>
            <section class="image w-full lg:w-[500px] lg:h-[500px]">
                <Skeleton class="w-full h-full rounded" />
            </section>
        </section>

    </section>
{:else}
    {#if tokens.length === 0}
        <section class="py-40 flex flex-col justify-center items-center w-full">
            <Text h2 class="text-center">No tokens found</Text>
            <Text class="mt-2" p>Head over to
                <u><a href="/create">"CREATE"</a></u>
                at the top to create a new token</Text>
        </section>
    {:else}

        <section class="w-full relative flex min-h-[600px] py-30 px-10">
            <figure class="absolute top-0 left-0 w-full h-full opacity-5" style="z-index:-1;">
                <img class="object-cover w-full h-full blur-xl" src={featured.parsedMetadata.image} alt={featured.parsedMetadata.name} />
            </figure>

            <section class="max-w-[1280px] mx-auto mt-10 flex gap-10 w-full h-full items-center flex-col-reverse lg:flex-row">

                <section class="details flex-1 w-full">
                    <Badge variant="outline">Featured</Badge>
                    <Text h1 class="mt-2 lg:!text-8xl">
                        <b>{featured.ticker.split(',')[1]}</b>
                    </Text>
                    <Text h2 class="mt-2 truncate">{featured.parsedMetadata.name}</Text>
                    <Text p class="mt-2 lg:max-w-[500px]">{featured.parsedMetadata.description}</Text>

                    <section class="mt-10">
                        <Button href="/token/{featured.ticker.split(',')[1]}">Go to <b class="ml-1">{featured.ticker.split(',')[1]}</b></Button>
                    </section>
                </section>
                <section class="image w-full lg:w-[500px] lg:h-[500px]">
                    <img class="object-cover w-full h-full" src={featured.parsedMetadata.image} alt={featured.parsedMetadata.name} />
                </section>
            </section>

        </section>


        <section class="max-w-[1280px] mx-auto mt-20">

            <section class="flex flex-wrap justify-between gap-10 gap-y-20 flex-col lg:flex-row">
                {#each tokens as token}
                    <a href="/token/{token.ticker.split(',')[1]}" class="token">
                        <section class="image mb-4">
                            <img class="object-cover w-full h-full"  src={token.parsedMetadata.image} alt={token.parsedMetadata.name} />
                        </section>
                        <section class="details">
                            <Text h2 class="truncate"><b>{token.ticker.split(',')[1]}</b> ({token.parsedMetadata.name})</Text>
                            <Text small>{token.parsedMetadata.description}</Text>
                        </section>
                    </a>
                {/each}
            </section>
        </section>

    {/if}
{/if}



<figure class="h-[200px]"></figure>

<style lang="scss">
    .token {
        display:flex;
        flex-direction: column;
        align-items: center;
        width: 25%;
        flex: 0 0 auto;
        text-align: left;

        .details {
            width: 100%;
        }

        .image {
            width: 100%;
            aspect-ratio: 1;
            max-height: 300px;
        }

        @media (max-width: 1024px) {
            width: 100%;
            flex: 1;

            .details {
                text-align: center;

            }

            .image {
                max-width: 100%;
                aspect-ratio: 1;
                max-height: 1000px;
            }
        }
    }
</style>
