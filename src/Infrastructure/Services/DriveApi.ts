import fs from 'fs';
import path from 'path';
import { google, drive_v3 } from 'googleapis';
import { DriveService } from '../../Domain/Services/DriveService';

// Ruta al archivo de credenciales
const KEYFILEPATH = path.join(__dirname, 'service-account-key.json');

// Alcances requeridos para la API de Drive
const SCOPES = ['https://www.googleapis.com/auth/drive'];

// Autenticación con Google API
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

// Cliente Drive
const drive: drive_v3.Drive = google.drive({ version: 'v3', auth });

export class DriveApi implements DriveService {
  private readonly folderId: string = '1wZo5tDeCy5Iv-VHGsuDqH1ZD3_t2IvJE';

  constructor() {}

  async deleteImageFromDrive(fileId: string): Promise<boolean> {
    try {
      await drive.files.delete({ fileId });
      return true;
    } catch (error) {
      console.error('Error deleting from Google Drive:', error);
      throw error;
    }
  }

  async uploadImageToDrive(filePath: string, fileName: string, mimeType: string): Promise<{ fileId: string; imageUrl: string }> {
    try {
      const fileMetadata = {
        name: fileName,
        parents: [this.folderId],
      };

      const media = {
        mimeType: mimeType,
        body: fs.createReadStream(filePath),
      };

      const response = await drive.files.create({
        requestBody: fileMetadata, // CORREGIDO: antes estaba mal como "resource"
        media,
        fields: 'id',
      });

      const fileId = response.data.id;
      if (!fileId) throw new Error('No se obtuvo el ID del archivo subido');

      // Hacer el archivo público
      await drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      const imageUrl = `https://drive.google.com/uc?id=${fileId}`;

      // Elimina el archivo temporal después de subirlo (opcional)
      fs.unlink(filePath, (err) => {
        if (err) console.warn(`No se pudo eliminar archivo temporal: ${filePath}`);
      });

      return { fileId, imageUrl };
    } catch (error) {
      console.error('Error uploading to Google Drive:', error);
      throw error;
    }
  }
}
