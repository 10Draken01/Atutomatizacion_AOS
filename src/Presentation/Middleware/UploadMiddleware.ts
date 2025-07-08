import multer, { FileFilterCallback, MulterError } from 'multer';
import { Request, Response, NextFunction } from 'express';

// Configuración de almacenamiento en memoria (NO guarda en disco)
const storage = multer.memoryStorage();

// Filtro para validar tipos de archivo (solo imágenes)
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'));
  }
};

// Configuración de multer con memoria y validación
export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 5 MB
  },
  fileFilter,
});

// Middleware para manejar errores de multer
export const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large',
        message: 'El archivo no puede ser mayor a 5MB',
      });
    }
    return res.status(400).json({
      success: false,
      error: 'Upload error',
      message: err.message,
    });
  }

  if (err && err.message === 'Solo se permiten archivos de imagen') {
    return res.status(400).json({
      success: false,
      error: 'Invalid file type',
      message: err.message,
    });
  }

  next(err);
};
