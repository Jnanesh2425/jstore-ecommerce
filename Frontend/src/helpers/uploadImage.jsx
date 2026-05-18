import uploadImageS3 from "./uploadImageS3"

const uploadToCloudinary = async (image) => {
    const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUD_NAME_CLOUDINARY}/image/upload`
    const formData = new FormData()
    formData.append("file", image)
    formData.append("upload_preset", "ecommerce_images")
    
    const dataResponse = await fetch(url, {
        method: "post",
        body: formData
    })
    
    return dataResponse.json()
}

const uploadImage = async (image) => {
    try {
        const s3Response = await uploadImageS3(image)
        
        if (s3Response.success) {
            return {
                success: true,
                url: s3Response.url,
                provider: "s3"
            }
        } else {
            throw new Error(s3Response.message || "S3 upload failed")
        }

    } catch (s3Error) {
        try {
            const cloudinaryResponse = await uploadToCloudinary(image)
            return {
                success: true,
                url: cloudinaryResponse.secure_url,
                provider: "cloudinary"
            }
        } catch (cloudinaryError) {
            throw new Error("Image upload failed from all providers")
        }
    }
}

export default uploadImage