<script lang="ts">
    // https://www.npmjs.com/package/svelte-file-dropzone
    import Dropzone from "svelte-file-dropzone";

    import DropImage from "$components/svgs/DropImage.svelte";
    import Text from "$components/ui/Text.svelte";
    import {newmeme, saveNewMeme} from "$stores/newmeme.store";

    let clazz:string = "";
    export { clazz as class };

    const acceptableTypes = ["image/jpeg", "image/png", "image/gif", "image/svg+xml"];

    let file = null;
    let filetype = "";
    let baseImage:string = "";

    const toBase64 = (file:File) => new Promise((resolve, reject): any => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
    });

    const resizeImageToMax = (file, maxSize) => {
        return new Promise(resolve => {
            try {
                const image = new Image();
                image.src = file;

                image.onload = () => {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    if(image.width === image.height){
                        canvas.width = maxSize;
                        canvas.height = maxSize;
                    } else {
                        if(image.width < image.height) {
                            canvas.width = maxSize;
                            canvas.height = image.height * (maxSize / image.width);
                        } else {
                            canvas.width = image.width * (maxSize / image.height);
                            canvas.height = maxSize;
                        }
                    }

                    ctx.drawImage(image, 0,0, canvas.width, canvas.height);
                    return resolve(canvas.toDataURL('image/jpeg'));
                }
            } catch(err) {
                console.error(err);
                return resolve(null);
            }
        })
    }

    const handleFilesSelect = async (e) => {
        const { acceptedFiles, fileRejections } = e.detail;
        file = acceptedFiles[0] || null;

        if(!file) return;
        if(!acceptableTypes.includes(file.type)) {
            alert("Invalid file type");
            return file = null;
        }

        filetype = file.type;
        baseImage = await toBase64(file) as string;
        baseImage = await resizeImageToMax(baseImage, 300);

        if(!baseImage) {
            alert("Failed to load image");
            baseImage = "";
            file = null;
            return;
        }

        $newmeme.parsedMetadata.image = baseImage;
        $newmeme.metadata = "";
        saveNewMeme();
    }

</script>

<section class="image-box {clazz}">
<!--    <img src="https://source.unsplash.com/random/300×300" alt="image" />-->


    <section class="drag-and-drop" class:alert={!$newmeme.parsedMetadata.image}>
        <section class="zone">
            <Dropzone containerStyles="height: 100%; width: 100%; position: absolute; z-index: 2;" disableDefaultStyles accept={acceptableTypes} on:drop={handleFilesSelect} />
        </section>
        <DropImage size={70} />
        <section class="texts">
            <Text h4>Click or drag-and-drop to add an image</Text>
            <Text small>Dimensions are 300x300 and JPG, PNG, GIF, and SVG</Text>
        </section>

        {#if !!$newmeme.parsedMetadata.image}
            <figure class="image">
                <img src={$newmeme.parsedMetadata.image} alt="meme-token" />
            </figure>
        {/if}
    </section>
</section>

<style lang="scss">
    .image-box {
        width: 100%;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .drag-and-drop {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 20px;
            border: 3px dashed #000;
            height: 100%;
            width: 100%;
            border-radius: 10px;



            &.alert {
                animation: dragalert 1s infinite;
            }

            @keyframes dragalert {
                0%,100% { border: 3px dashed #000; }
                50% { border: 3px dashed red; }
            }

            .texts {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
                text-align: center;
            }

            .zone {
                position: absolute;
                width: 100%;
                height: 100%;

                :global(p) {
                    display:none;
                }
            }

            .image {
                position: absolute;
                width: 100%;
                height: 100%;
                z-index: 1;
                border-radius: 6px;
                overflow: hidden;
                background: #fff;

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: fill;
                }
            }
        }
    }
</style>
