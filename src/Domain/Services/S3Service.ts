export interface S3Service {
  uploadFile(file: Express.Multer.File, name_file: string): Promise<string>; // Devuelve la URL pública
}