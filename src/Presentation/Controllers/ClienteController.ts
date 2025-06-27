import { Request, Response } from 'express';
import { CreateClienteUseCase } from '../../Application/UseCases/Cliente/CreateClienteUseCase';
import { CreateClienteRequest } from '../../Application/DTOs/CreateCliente/CreateClienteRequest';
import { ClienteAlreadyExistsException } from '../../Application/Exceptions/ClienteAlreadyExistsException';

export class ClienteController {
  constructor(
    private readonly createClienteUseCase: CreateClienteUseCase
  ) { }

  async createCliente(req: Request, res: Response): Promise<void> {
    try {
      // Validación previa del archivo (opcional, depende de tu lógica de negocio)
      if (!req.file?.buffer && !req.body.character_icon) {
        res.status(400).json({
          success: false,
          error: 'Missing character_icon',
          message: 'Se requiere un icono de personaje como archivo o en el cuerpo del request.',
        });
        return;
      }

      const character_icon = req.file ?? req.body.character_icon;

      const request: CreateClienteRequest = {
        clave_cliente: req.body.clave_cliente,
        nombre: req.body.nombre,
        celular: req.body.celular,
        email: req.body.email,
        character_icon,
      };

      if (req.file) {
        console.log(`Archivo recibido: ${req.file.originalname} (${req.file.mimetype}, ${req.file.size} bytes)`);
      }

      const response = await this.createClienteUseCase.execute(request);

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      console.error('Error al crear cliente:', error);

      if (error instanceof ClienteAlreadyExistsException) {
        res.status(409).json({
          success: false,
          error: 'Conflict',
          message: error.message,
        });
        return;
      }

      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
      });
    }
  }
}
