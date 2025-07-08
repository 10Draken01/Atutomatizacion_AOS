import { Request, Response } from 'express';
import { UserAlreadyExistsException } from '../../Application/Exceptions/UserAlreadyExistsException';
import { RegisterUseCase } from '../../Application/UseCases/User/RegisterUserUseCase';
import { RegisterRequest } from '../../Application/DTOs/Register/RegisterRequest';
import { UserNotExistsException } from '../../Application/Exceptions/UserNotExistsException';
import { LoginRequest } from '../../Application/DTOs/Login/LoginRequest';
import { LoginUseCase } from '../../Application/UseCases/User/LoginUserUseCase';

export class UserController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase
  ) {}

  async login(req: Request, res: Response): Promise<void> {
    try{
      const request: LoginRequest = {
        email: req.body.email,
        password: req.body.password,
      };

      var response = await this.loginUseCase.execute(request);

      // devolver el token en cabecera
      res.setHeader('Authorization', `Bearer ${response.token}`);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          id: response.id,
          username: response.username,
          email: response.email
        }
      });
    } catch (error) {
      if (error instanceof UserNotExistsException) {
        res.status(404).json({
          success: false,
          error: 'Conflict',
          message: error.message
        });
        return;
      }

      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
      });
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const request: RegisterRequest = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
      };

      const response = await this.registerUseCase.execute(request);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: response
      });
    } catch (error) {
      if (error instanceof UserAlreadyExistsException) {
        res.status(409).json({
          success: false,
          error: 'Conflict',
          message: error.message
        });
        return;
      }

      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
      });
    }
  }
}
