import { Router } from 'express';
import { AuthMiddleware, validateCreateCliente, validateGetCliente, validateGetClientes, validateUpdateCliente } from '../Middleware/ValidationMiddleware';
import { ClienteController } from '../Controllers/ClienteController';
import { TokenService } from '../../Domain/Services/TokenService';
import { uploadMiddleware } from '../Middleware/UploadMiddleware';

export class ClienteRoutes {
  private router: Router;

  constructor(
    private readonly clienteController: ClienteController,
    private readonly tokenService: TokenService
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    const auth = AuthMiddleware(this.tokenService);

    this.router.post('/', auth, uploadMiddleware.single('character_icon'), validateCreateCliente, (req, res) => 
      this.clienteController.createCliente(req, res)
    );
    this.router.put('/:clave_cliente', auth, uploadMiddleware.single('character_icon'), validateUpdateCliente, (req, res) => 
      this.clienteController.updateCliente(req, res)
    );
    this.router.get('/page/:page', auth, validateGetClientes, (req, res) => 
      this.clienteController.getPageClientes(req, res)
    );
    this.router.get('/:clave_cliente', auth, validateGetCliente, (req, res) => 
      this.clienteController.getCliente(req, res)
    );
    this.router.delete('/:clave_cliente', auth, (req, res) => 
      this.clienteController.deleteCliente(req, res)
    );
  }

  getRouter(): Router {
    return this.router;
  }
}