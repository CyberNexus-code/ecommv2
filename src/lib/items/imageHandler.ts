const SUPPORTED_IMAGE_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
])

const SUPPORTED_IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif'])

export function isSupportedImageFile(file: File): boolean {
    if (file.type && SUPPORTED_IMAGE_MIME_TYPES.has(file.type.toLowerCase())) {
        return true
    }

    const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
    return SUPPORTED_IMAGE_EXTENSIONS.has(extension)
}

export async function convertToWebP(file: File, {maxSize = 1400, quality = 0.72} = {}): Promise<File> {
    if(!file.type.startsWith("image/") && !isSupportedImageFile(file)){
        throw new Error("Not an image");
    }

    if (!isSupportedImageFile(file)) {
        throw new Error(`Unsupported image format: ${file.name}. Please use JPG, PNG, WEBP, or GIF.`)
    }

    if(file.size > 10 * 1024 * 1024){
        throw new Error("Image too large (max 10MB)");
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result)
                return
            }

            reject(new Error('Image data could not be read'))
        }

        reader.onerror = () => reject(new Error('Image data could not be read'))
        reader.readAsDataURL(file)
    })

    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image()

        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error(`Image could not be loaded: ${file.name}`))
        img.src = dataUrl
    })

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
}