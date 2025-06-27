import { S3Client, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { S3Service } from '../../Domain/Services/S3Service';

export class S3UploaderService implements S3Service {
  private readonly s3: S3Client;
  private readonly bucketName: string;

  constructor(region: string, accessKeyId: string, secretAccessKey: string, bucketName: string, session_token: string) {
    this.s3 = new S3Client({
      region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
        sessionToken: session_token, // Opcional, si estás usando credenciales temporales
      },
    });

    this.bucketName = bucketName;
  }

  async uploadFile(file: Express.Multer.File, name_file: string): Promise<string> {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${name_file}${fileExtension}`;
    const key = `uploads/${fileName}`;

    const params: PutObjectCommandInput = {
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    try {
      const command = new PutObjectCommand(params);
      await this.s3.send(command);

      // Construye manualmente la URL pública (no viene en la respuesta en v3)
      return `https://${this.bucketName}.s3.${this.s3.config.region}.amazonaws.com/${key}`;
    } catch (error) {
      throw new Error(`Error al subir el archivo a S3: ${error}`);
    }
  }
}
