import { Router } from 'express';
import { UserController } from '../Controllers/UserController';
import { validateLogin, validateRegister } from '../Middleware/ValidationMiddleware';

export class UserRoutes {
  private router: Router;

  constructor(private readonly userController: UserController) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post('/register', validateRegister, (req, res) => 
      this.userController.register(req, res)
    );
    this.router.post('/login', validateLogin, (req, res) => 
      this.userController.login(req, res)
    );
  }

  getRouter(): Router {
    return this.router;
  }
}