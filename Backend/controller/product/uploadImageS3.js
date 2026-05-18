const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

async function uploadImageS3Controller(req, res) {
    try {
        const file = req.file; // From multer middleware
        
        if (!file) {
            return res.status(400).json({
                message: "No file provided",
                error: true,
                success: false
            });
        }

        // Generate unique filename
        const fileName = `products/${Date.now()}-${file.originalname}`;

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileName,
            Body: file.buffer, // File data from multer
            ContentType: file.mimetype,
        });

        await s3Client.send(command);

        // Generate S3 URL
        const s3Url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

        return res.status(200).json({
            message: "Image uploaded successfully",
            error: false,
            success: true,
            data: {
                url: s3Url,
                provider: "s3"
            }
        });

    } catch (error) {
        console.error("S3 Upload Error:", error);
        return res.status(400).json({
            message: error.message || "Upload failed",
            error: true,
            success: false
        });
    }
}

module.exports = uploadImageS3Controller;