export interface DriveService {
  deleteImageFromDrive(fileId: string): Promise<boolean>; // Elimina un archivo de Google Drive
  uploadImageToDrive(file: any, fileName: string): Promise<{ fileId: string; imageUrl: string }>
}