export interface DriveService {
  deleteImageFromDrive(fileId: string): Promise<boolean>; // Elimina un archivo de Google Drive
  uploadImageToDrive(filePath: string, fileName: string, mimeType: string): Promise<{ fileId: string; imageUrl: string }>
}