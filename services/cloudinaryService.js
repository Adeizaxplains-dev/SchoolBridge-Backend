import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

/*
=========================================
☁️ CLOUDINARY CONFIG
=========================================
*/
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/*
=========================================
📤 UPLOAD FILE TO CLOUDINARY
=========================================
*/
export const uploadToCloudinary = async (
  filePath,
  folder = "schoolbridge"
) => {
  try {
    if (!filePath) {
      throw new Error("File path is required");
    }

    const result =
      await cloudinary.uploader.upload(
        filePath,
        {
          folder,
          resource_type: "auto", // supports images, pdf, videos
        }
      );

    // Remove file from server after upload (important for SaaS scaling)
    fs.unlinkSync(filePath);

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error(
      "Cloudinary Upload Error:",
      error.message
    );

    throw new Error(
      "File upload failed"
    );
  }
};

/*
=========================================
🗑️ DELETE FILE FROM CLOUDINARY
=========================================
*/
export const deleteFromCloudinary =
  async (publicId) => {
    try {
      if (!publicId) return;

      await cloudinary.uploader.destroy(
        publicId
      );

      return true;
    } catch (error) {
      console.error(
        "Cloudinary Delete Error:",
        error.message
      );

      return false;
    }
  };