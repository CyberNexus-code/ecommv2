export async function convertToWebP(file: File, {maxSize = 1400, quality = 0.72} = {}): Promise<File> {
    if(!file.type.startsWith("image/")){
        throw new Error("Not an image");
    }

    if(file.size > 10 * 1024 * 1024){
        throw new Error("Image too large (max 10MB)");
    }

    const imageBitmap = await createImageBitmap(file);

    const scale = Math.min(
        maxSize / imageBitmap.width,
        maxSize / imageBitmap.height,
        1
    )

    const width = Math.round(imageBitmap.width * scale);
    const height = Math.round(imageBitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if( !ctx ) throw new Error("canvas not supported");

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(imageBitmap, 0, 0, width, height);
    imageBitmap.close();

    const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b): reject("WebP conversion failed")), "image/webp", quality);
    });

    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const webpFileName = `${baseName}.webp`;

    return new File([blob], webpFileName, { type: "image/webp"})
}