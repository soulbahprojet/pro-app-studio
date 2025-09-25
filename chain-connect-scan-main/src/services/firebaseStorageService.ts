import { 
  ref, 
  uploadBytes, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject, 
  listAll,
  getMetadata,
  updateMetadata
} from 'firebase/storage';
import { firebaseStorage } from '@/lib/firebase';

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
}

export class FirebaseStorageService {
  // Upload file with progress
  async uploadFile(
    file: File, 
    path: string, 
    onProgress?: (progress: UploadProgress) => void
  ) {
    try {
      const storageRef = ref(firebaseStorage, path);
      
      if (onProgress) {
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        return new Promise((resolve, reject) => {
          uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = {
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes,
                progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              };
              onProgress(progress);
            },
            (error) => reject(error),
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve({ downloadURL, error: null });
              } catch (error) {
                reject(error);
              }
            }
          );
        });
      } else {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return { downloadURL, error: null };
      }
    } catch (error: any) {
      return { downloadURL: null, error: error.message };
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(
    files: File[], 
    basePath: string,
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ) {
    const uploadPromises = files.map((file, index) => {
      const filePath = `${basePath}/${Date.now()}_${file.name}`;
      return this.uploadFile(file, filePath, (progress) => {
        if (onProgress) onProgress(index, progress);
      });
    });

    try {
      const results = await Promise.all(uploadPromises);
      return { 
        results: results.map((r: any) => r.downloadURL).filter(Boolean), 
        error: null 
      };
    } catch (error: any) {
      return { results: [], error: error.message };
    }
  }

  // Upload chat image
  async uploadChatImage(file: File, orderId: string, senderId: string) {
    const timestamp = Date.now();
    const path = `chats/${orderId}/images/${senderId}_${timestamp}_${file.name}`;
    return this.uploadFile(file, path);
  }

  // Upload product images
  async uploadProductImages(files: File[], productId: string, sellerId: string) {
    const basePath = `products/${sellerId}/${productId}/images`;
    return this.uploadMultipleFiles(files, basePath);
  }

  // Upload profile avatar
  async uploadAvatar(file: File, userId: string) {
    const path = `avatars/${userId}/${Date.now()}_${file.name}`;
    return this.uploadFile(file, path);
  }

  // Upload shop banner
  async uploadShopBanner(file: File, shopId: string) {
    const path = `shops/${shopId}/banner/${Date.now()}_${file.name}`;
    return this.uploadFile(file, path);
  }

  // Upload verification documents
  async uploadVerificationDocument(file: File, userId: string, documentType: string) {
    const path = `verification/${userId}/${documentType}/${Date.now()}_${file.name}`;
    return this.uploadFile(file, path);
  }

  // Get file download URL
  async getDownloadURL(path: string) {
    try {
      const storageRef = ref(firebaseStorage, path);
      const downloadURL = await getDownloadURL(storageRef);
      return { downloadURL, error: null };
    } catch (error: any) {
      return { downloadURL: null, error: error.message };
    }
  }

  // Delete file
  async deleteFile(path: string) {
    try {
      const storageRef = ref(firebaseStorage, path);
      await deleteObject(storageRef);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  // List files in directory
  async listFiles(path: string) {
    try {
      const storageRef = ref(firebaseStorage, path);
      const result = await listAll(storageRef);
      
      const files = await Promise.all(
        result.items.map(async (itemRef) => {
          const downloadURL = await getDownloadURL(itemRef);
          const metadata = await getMetadata(itemRef);
          return {
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            downloadURL,
            size: metadata.size,
            contentType: metadata.contentType,
            timeCreated: metadata.timeCreated,
            updated: metadata.updated
          };
        })
      );

      return { files, error: null };
    } catch (error: any) {
      return { files: [], error: error.message };
    }
  }

  // Get file metadata
  async getFileMetadata(path: string) {
    try {
      const storageRef = ref(firebaseStorage, path);
      const metadata = await getMetadata(storageRef);
      return { metadata, error: null };
    } catch (error: any) {
      return { metadata: null, error: error.message };
    }
  }

  // Update file metadata
  async updateFileMetadata(path: string, newMetadata: any) {
    try {
      const storageRef = ref(firebaseStorage, path);
      const metadata = await updateMetadata(storageRef, newMetadata);
      return { metadata, error: null };
    } catch (error: any) {
      return { metadata: null, error: error.message };
    }
  }

  // Helper function to create optimized image path
  createImagePath(category: string, id: string, filename: string) {
    const timestamp = Date.now();
    const extension = filename.split('.').pop();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${category}/${id}/${timestamp}_${sanitizedFilename}`;
  }

  // Batch delete files
  async deleteMultipleFiles(paths: string[]) {
    const deletePromises = paths.map(path => this.deleteFile(path));
    try {
      const results = await Promise.all(deletePromises);
      return { results, error: null };
    } catch (error: any) {
      return { results: [], error: error.message };
    }
  }
}

export const firebaseStorageService = new FirebaseStorageService();