<script lang="ts">
    export let h1:boolean = false;
    export let h2:boolean = false;
    export let h3:boolean = false;
    export let h4:boolean = false;
    export let p:boolean = false;
    export let blockquote:boolean = false;
    export let list:boolean = false;
    export let code:boolean = false;
    export let lead:boolean = false;
    export let large:boolean = false;
    export let small:boolean = false;
    export let muted:boolean = false;
    let clazz:string = "";
    export {clazz as class};


</script>

{#if h1}
    <h1 class="scroll-m-20 text-4xl font-black tracking-tight lg:text-5xl italic uppercase {clazz}">
        <slot />
    </h1>

{:else if h2}
    <h2 class="scroll-m-20 text-3xl font-bold tracking-tight transition-colors first:mt-0 {clazz}">
        <slot />
    </h2>
{:else if h3}
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight {clazz}">
        <slot />
    </h3>
{:else if h4}
    <h4 class="scroll-m-20 text-xl font-semibold tracking-tight leading-6 {clazz}">
        <slot />
    </h4>
{:else if p}
    <p class="leading-6 {clazz}">
        <slot />
    </p>
{:else if blockquote}
    <blockquote class="mt-6 border-l-2 pl-6 italic {clazz}">
        <slot />
    </blockquote>
{:else if list}
    <ul class="my-6 ml-6 list-disc [&>li]:mt-2 {clazz}">
        <slot />
    </ul>
{:else if code}
    <code class="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold {clazz}">
        <slot />
    </code>
{:else if lead}
    <p class="text-xl text-muted-foreground {clazz}">
        <slot />
    </p>
{:else if large}
    <div class="text-lg font-semibold {clazz}">
        <slot />
    </div>
{:else if small}
    <small class="text-sm font-medium leading-1 {clazz}">
        <slot />
    </small>
{:else if muted}
    <p class="text-sm text-muted-foreground {clazz}">
        <slot />
    </p>
{/if}




