<script lang="ts">
    import "$styles/styles.scss";
    import Logo from "$components/svgs/Logo.svelte";
    import {Button} from "$components/ui/button";
    import * as Avatar from "$components/ui/avatar";
    import {onMount} from "svelte";
    import { Toaster } from "$components/ui/sonner";
    import { ModeWatcher, setMode, mode } from "mode-watcher";
    import { page } from '$app/stores';
    import BlockchchainService, {account} from "$services/blockchain.service";
    import { Separator } from "$components/ui/separator";
    import Disconnect from "$components/svgs/Disconnect.svelte";

    setMode("light");

    onMount(() => BlockchchainService.init());

</script>

<svelte:head>
    <title>MemeMachine</title>
    <meta name="description" content="MemeMachine is a meme token explorer and creator." />
    <meta property="og:image" content="https://mememachines.netlify.app/ogimage.png">
    <meta property="og:locale" content="en" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="627" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="MemeMachine" />
    <meta property="og:description" content="MemeMachine is a meme token explorer and creator." />
    <meta property="og:url" content="https://mememachines.netlify.app" />
    <meta property="og:site_name" content="MemeMachine" />
</svelte:head>

<ModeWatcher />
<Toaster />

<nav class="flex items-center px-6 py-6">
    <section class="mr-6">
        <a href="/">
            <Logo fill="#000" />
        </a>

    </section>
    <section class="flex gap-6 flex-1">
<!--        <a href="/" class="link" class:active={$page.url.pathname === '/' || $page.url.pathname.startsWith('/token')}>Explore</a>-->
<!--        <a href="/create" class="link" class:active={$page.url.pathname.startsWith('/create')}>Create</a>-->
    </section>
    <section class="flex items-center gap-1">
        {#if $account}
            <Button href="/create">Create</Button>
<!--            <Avatar.Root>-->
<!--                <Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" />-->
<!--                <Avatar.Fallback>CN</Avatar.Fallback>-->
<!--            </Avatar.Root>-->
            <Button variant="secondary" class="flex gap-2 items-center" on:click={BlockchchainService.logout}>
                <figure class="text-xs opacity-60">{$account.substring(0,4)}...</figure>
                <Separator orientation="vertical" />
                <Disconnect />
            </Button>
        {:else}
            <Button on:click={BlockchchainService.login}>Connect</Button>
        {/if}
    </section>
</nav>

<section class="global">
    <slot />
</section>

<style lang="scss">
    nav {
        .link {
            color: #000;
            font-size: 20px;
            font-style: italic;
            font-weight: 900;
            line-height: normal;
            text-transform: uppercase;
            opacity: 0.2;

            transition: opacity 0.2s;

            &.active {
                opacity: 1;
            }

            &:hover {
                opacity: 1;
            }
        }

        .account {
            color: #000;
            font-size: 16px;
            font-style: italic;
            font-weight: 900;
            line-height: normal;
            margin-right: 10px;
        }
    }

    .global-container {
        display: flex;
        width: 100%;


    }
</style>
