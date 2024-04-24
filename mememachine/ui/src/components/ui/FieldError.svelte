<script lang="ts">
    import Text from '$components/ui/Text.svelte';
</script>

<section class="flex w-full justify-end mt-2">
    <Text small class="text-red-500 text-xs blinking">
        <slot />
    </Text>
</section>
