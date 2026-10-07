import { v2 as cloudinary } from "cloudinary";

// Never log Cloudinary credentials.
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.warn("Cloudinary is not configured - image uploads disabled.");
}

export default cloudinary;
