const { v2: cloudinary } = require('cloudinary');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Configure Cloudinary (as Firebase alternative for media storage)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, videos, audio, and documents
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/quicktime',
      'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mpeg',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

class FirebaseService {
  // Upload single file
  async uploadFile(file, folder = 'general') {
    try {
      const fileId = uuidv4();
      const fileName = `${folder}/${fileId}_${file.originalname}`;
      
      // Determine resource type based on file type
      let resourceType = 'auto';
      if (file.mimetype.startsWith('video/')) {
        resourceType = 'video';
      } else if (file.mimetype.startsWith('audio/')) {
        resourceType = 'video'; // Cloudinary treats audio as video
      } else if (file.mimetype.startsWith('image/')) {
        resourceType = 'image';
      } else {
        resourceType = 'raw'; // For documents
      }

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: resourceType,
            public_id: fileName,
            folder: folder,
            use_filename: true,
            unique_filename: false
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        
        uploadStream.end(file.buffer);
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        resourceType: result.resource_type
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('File upload failed');
    }
  }

  // Upload multiple files
  async uploadFiles(files, folder = 'general') {
    try {
      const uploadPromises = files.map(file => this.uploadFile(file, folder));
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw new Error('Files upload failed');
    }
  }

  // Delete file
  async deleteFile(publicId, resourceType = 'image') {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });
      return result;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('File deletion failed');
    }
  }

  // Generate signed URL for secure uploads (client-side)
  generateSignedUploadUrl(folder = 'general') {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const params = {
      timestamp: timestamp,
      folder: folder,
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
    };

    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);
    
    return {
      url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/auto/upload`,
      params: {
        ...params,
        signature: signature,
        api_key: process.env.CLOUDINARY_API_KEY
      }
    };
  }

  // Get file info
  async getFileInfo(publicId, resourceType = 'image') {
    try {
      const result = await cloudinary.api.resource(publicId, {
        resource_type: resourceType
      });
      return result;
    } catch (error) {
      console.error('Error getting file info:', error);
      throw new Error('Failed to get file info');
    }
  }

  // Transform image (resize, crop, etc.)
  transformImage(publicId, transformations) {
    return cloudinary.url(publicId, {
      ...transformations,
      secure: true
    });
  }
}

module.exports = {
  firebaseService: new FirebaseService(),
  upload
};