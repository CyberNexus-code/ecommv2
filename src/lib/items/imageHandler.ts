export async function convertToWebP(file: File, {maxSize = 1400, quality = 0.72} = {}): Promise<File> {
    if(!file.type.startsWith("image/")){
        throw new Error("Not an image");
    }

    if(file.size > 10 * 1024 * 1024){
        throw new Error("Image too large (max 10MB)");
    }

    const objectUrl = URL.createObjectURL(file)
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image()

        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error("Image could not be loaded"))
        img.src = objectUrl
    })

    try {
        const scale = Math.min(
            maxSize / image.width,
            maxSize / image.height,
            1
        )

        const width = Math.round(image.width * scale);
        const height = Math.round(image.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if( !ctx ) throw new Error("canvas not supported");

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(image, 0, 0, width, height);

        const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((b) => (b ? resolve(b): reject("WebP conversion failed")), "image/webp", quality);
        });

        const baseName = file.name.replace(/\.[^/.]+$/, "");
        const webpFileName = `${baseName}.webp`;

        return new File([blob], webpFileName, { type: "image/webp"})
    } finally {
        URL.revokeObjectURL(objectUrl)
    }
}