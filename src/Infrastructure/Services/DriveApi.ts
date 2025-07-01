import fs from 'fs';
import path from 'path';
import { google, drive_v3 } from 'googleapis';
import { DriveService } from '../../Domain/Services/DriveService';
import { Readable } from 'stream';

// Ruta al archivo de credenciales
const KEYFILEPATH = path.join(__dirname, 'apipm-464221-1669bb9b132d.json');

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
  private readonly folderId: string;

  constructor(folder_id: string) {
    this.folderId = folder_id;
  }

  async deleteImageFromDrive(fileId: string): Promise<boolean> {
    try {
      await drive.files.delete({ fileId });
      return true;
    } catch (error) {
      console.error('Error deleting from Google Drive:', error);
      throw error;
    }
  }

  async uploadImageToDrive(file: any, fileName: string): Promise<{ fileId: string; imageUrl: string }> {
    try {
      const fileMetadata = {
        name: fileName,
        parents: [this.folderId],
      };

      // Convertir el Buffer a un Stream readable
      const bufferStream = new Readable();
      bufferStream.push(file.buffer);
      bufferStream.push(null); // Indica el final del stream

      const media = {
        mimeType: file.mimetype,
        body: bufferStream,
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
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

      return { fileId, imageUrl };
    } catch (error) {
      console.error('Error uploading to Google Drive:', error);
      throw error;
    }
  }
}
