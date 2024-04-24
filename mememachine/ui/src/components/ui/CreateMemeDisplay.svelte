<script lang="ts">
    import {newmeme, saveNewMeme} from "$stores/newmeme.store";
    import ImageBox from "$components/ui/ImageBox.svelte";
    import Text from "$components/ui/Text.svelte";
    import {humanReadableNumber} from "$utils/numbers";

    $: keyvals = [
        $newmeme.ticker ? [ $newmeme.ticker.toUpperCase(), "Ticker"] : [],
        $newmeme.decimals ? [ $newmeme.decimals, "Decimals"] : [],
        !!parseInt($newmeme.max_supply) ? [ humanReadableNumber(parseInt($newmeme.max_supply)), "Total supply"] : [],
        !!parseInt($newmeme.tokens_per_mint) ? [ humanReadableNumber(parseInt($newmeme.tokens_per_mint)), "Tokens per mint"] : [],
        !!parseInt($newmeme.tokens_per_mint) && !!parseInt($newmeme.max_supply )? [ humanReadableNumber(parseInt($newmeme.max_supply) / parseInt($newmeme.tokens_per_mint)), "Total mints possible"] : [],
    ].filter(x => !!x.length);

    export let hideTexts: boolean = false;
</script>

<section class="flex-0 lg:min-w-[480px] max-w-[480px] lg:pr-5 mt-10 lg:mt-0">
    <ImageBox class="aspect-square" />
    {#if !hideTexts}
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
                    <Text small><b>{item[0]}</b></Text>
                    <Text muted class="text-xs italic">{item[1]}</Text>
                </figure>
            {/each}
        </section>
    {/if}

</section>

