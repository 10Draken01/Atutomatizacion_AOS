import { Request, Response } from 'express';
import { CreateClienteUseCase } from '../../Application/UseCases/Cliente/CreateClienteUseCase';
import { CreateClienteRequest } from '../../Application/DTOs/CreateCliente/CreateClienteRequest';
import { ClienteAlreadyExistsException } from '../../Application/Exceptions/ClienteAlreadyExistsException';
import { UpdateClienteUseCase } from '../../Application/UseCases/Cliente/UpdateClienteUseCase';
import { GetPageClientesUseCase } from '../../Application/UseCases/Cliente/GetPageClientesUseCase';
import { InvalidPageException } from '../../Application/Exceptions/InvalidPageException';
import { GetClienteUseCase } from '../../Application/UseCases/Cliente/GetClienteUseCase';
import { ClienteNotExistsException } from '../../Application/Exceptions/ClienteNotExistsException';
import { DeleteClienteUseCase } from '../../Application/UseCases/Cliente/DeleteClienteUseCase';

export class ClienteController {
  constructor(
    private readonly createClienteUseCase: CreateClienteUseCase,
    private readonly updateClienteUseCase: UpdateClienteUseCase, // Asumiendo que el mismo caso de uso maneja creación y actualización
    private readonly getPageClientesUseCase: GetPageClientesUseCase, // Asumiendo que tienes un caso de uso para obtener la página de clientes
    private readonly getClienteUseCase: GetClienteUseCase, // Asumiendo que tienes un caso de uso para obtener un cliente específico
    private readonly deleteClienteUseCase: DeleteClienteUseCase
  ) { }

  async createCliente(req: Request, res: Response): Promise<void> {
    try {

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

  async updateCliente(req: Request, res: Response): Promise<void> {
    try {
      const character_icon = req.file ?? req.body.character_icon;

      const request: CreateClienteRequest = {
        clave_cliente: req.params.clave_cliente, // Asumiendo que la clave del cliente se pasa como parámetro de ruta
        nombre: req.body.nombre,
        celular: req.body.celular,
        email: req.body.email,
        character_icon: character_icon,
      };

      if (req.file) {
        console.log(`Archivo recibido: ${req.file.originalname} (${req.file.mimetype}, ${req.file.size} bytes)`);
      }

      const response = await this.updateClienteUseCase.execute(request);

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      console.error('Error al actualizar cliente:', error);

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

  async getPageClientes (req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.params.page as string) || 1; // Obtener el número de página desde la query, por defecto 1

      const response = await this.getPageClientesUseCase.execute({ page });

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      console.error('Error al obtener página de clientes:', error);

      if (error instanceof InvalidPageException) {
        res.status(400).json({
          success: false,
          error: 'Invalid Page',
          message: error.message,
        });
        return;
      }
      if (error instanceof Error) {

        res.status(500).json({
          success: false,
          error: 'Internal Server Error',
          message: 'An unexpected error occurred',
        });
      }
    }
  }

  async getCliente(req: Request, res: Response): Promise<void> {
    try {
      const clave_cliente = req.params.clave_cliente; // Asumiendo que la clave del cliente se pasa como parámetro de ruta

      const response = await this.getClienteUseCase.execute({ clave_cliente });

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      console.error('Error al obtener cliente:', error);

      if (error instanceof ClienteNotExistsException) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
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

  deleteCliente(req: Request, res: Response): void {
    try{
      const clave_cliente = req.params.clave_cliente; 

      const response = this.deleteClienteUseCase.execute({ clave_cliente });

      res.status(200).json({
        success: true,
        message: `Cliente con clave ${clave_cliente} eliminado correctamente.`,
      });
    } catch (error) {
      console.error('Error al obtener cliente:', error);

      if (error instanceof ClienteNotExistsException) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
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