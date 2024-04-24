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
    import {toast} from "svelte-sonner";
    import {account} from "$services/blockchain.service";

    const MAX_NAME_LENGTH = 32;
    const MAX_DESCRIPTION_LENGTH = 300;
    $: nameTooShort = $newmeme.parsedMetadata.name.length > 0 && $newmeme.parsedMetadata.name.length < 3;
    $: nameTooLong = $newmeme.parsedMetadata.name.length > MAX_NAME_LENGTH;
    $: descriptionTooLong = $newmeme.parsedMetadata.description.length > MAX_DESCRIPTION_LENGTH;
    $: invalidLink = $newmeme.parsedMetadata.link.length > 0 && !$newmeme.parsedMetadata.link.match(/https?:\/\/.+/);


    const submit = async () => {
        if(!$newmeme.parsedMetadata.name.length) return document.getElementById('name').focus();
        if(nameTooShort || nameTooLong) return;
        if(descriptionTooLong) return;
        if(invalidLink) return;
        if(!$newmeme.parsedMetadata.image.length) {
            return toast.error('Please select an image');
        }

        saveNewMeme();

        await goto('/create/properties');
    }

    const changedMeta = () => {
        $newmeme.metadata = "";
        saveNewMeme();
    }

    onMount(() => {
        const stored = LocalStorageService?.get('newmeme');
        if(stored) {
            newmeme.set(new Token(stored));
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
        <Text h1>Create a meme token</Text>
        <Text p>Meme tokens are silly tokens that only exist for the meme culture.</Text>

        <section class="flex flex-col gap-8 mt-8">
            <section>
                <section class="flex mb-2 justify-between">
                    <Text small><b>Name</b> (required)</Text>
                    <Text small class="{nameTooLong ? 'text-red-500' : ''}">{$newmeme.parsedMetadata.name.length}<b>/{MAX_NAME_LENGTH}</b></Text>
                </section>
                <Input id="name" on:input={changedMeta} bind:value={$newmeme.parsedMetadata.name} placeholder="Enter a name for your token" />
                {#if nameTooShort}
                    <FieldError>Name is too short</FieldError>
                {/if}
                {#if nameTooLong}
                    <FieldError>Name is too long</FieldError>
                {/if}
            </section>

            <section>
                <section class="flex mb-2 justify-between">
                    <Text small><b>Description</b></Text>
                    <Text small>{$newmeme.parsedMetadata.description.length}<b>/{MAX_DESCRIPTION_LENGTH}</b></Text>
                </section>
                <Textarea on:input={changedMeta} bind:value={$newmeme.parsedMetadata.description} placeholder="Describe what this token is, who it's for, and why it exists." />
                {#if descriptionTooLong}
                    <FieldError>Description is too long</FieldError>
                {/if}
            </section>

            <section>
                <section class="flex mb-2 justify-between">
                    <Text small><b>Link</b></Text>
                </section>
                <Input on:input={changedMeta} bind:value={$newmeme.parsedMetadata.link} placeholder="https://eosnetwork.com" />
                {#if invalidLink}
                    <FieldError>Invalid link</FieldError>
                {/if}
            </section>

            <section class="flex justify-end gap-1">
                <Button on:click={submit}>Continue</Button>
            </section>
        </section>


    </section>
{/if}
