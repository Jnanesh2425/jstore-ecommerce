import summaryAPI from "../common"

const uploadImageS3 = async (image) => {
    const formData = new FormData()
    formData.append("image", image)

    const response = await fetch(summaryAPI.uploadImageS3.url, {
        method: summaryAPI.uploadImageS3.method,
        credentials: "include",
        body: formData
    })

    const responseData = await response.json()
    
    if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || "S3 upload failed")
    }
    
    if (!responseData.data?.url) {
        throw new Error("Invalid S3 response: missing URL")
    }
    
    return {
        success: responseData.success,
        url: responseData.data.url,
        provider: "s3",
        message: responseData.message
    }
}

export default uploadImageS3