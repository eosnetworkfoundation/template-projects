<section class="meme-container">
    <section class="inner-container flex-col-reverse lg:flex-row">
        <slot />
    </section>
</section>

<style lang="scss">

    .meme-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        padding: 50px 20px;

        .inner-container {
            display: flex;
            width: 100%;
            max-width: 1280px;

            > section:nth-child(1) {
                width: 100%;
                max-width: 480px;
            }

            > section:nth-child(2) {
                flex: 1;
            }
        }


    }
</style>
