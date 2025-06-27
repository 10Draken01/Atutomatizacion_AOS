import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../../Domain/Services/TokenService';

export const validateRegister = (req: Request, res: Response, next: NextFunction): void => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400).json({ error: `'Username, Email y Password son requeridos.'` });
    return;
  }
  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email y Password son requeridos.' });
    return;
  }
  next();
};

export const validateCreateCliente = (req: Request, res: Response, next: NextFunction): void => {
  const { clave_cliente, nombre, celular, email } = req.body;
  
  if (!clave_cliente || !nombre || !celular || !email) {
    res.status(400).json({ 
      success: false,
      error: 'Validation Error',
      message: 'Clave cliente, nombre, celular y email son requeridos.' 
    });
    return;
  }
  
  // Validar formato de email básico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ 
      success: false,
      error: 'Validation Error',
      message: 'El formato del email no es válido.' 
    });
    return;
  }
  
  next();
};

export const AuthMiddleware = (tokenService: TokenService) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1];

      if (!token) {
        res.status(401).json({ 
          success: false,
          error: 'Unauthorized',
          message: 'Token de autenticación requerido.' 
        });
        return;
      }

      const decoded = await tokenService.verifyToken(token);
      (req as any).user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ 
        success: false,
        error: 'Unauthorized',
        message: 'Token inválido o expirado.' 
      });
    }
  };
};