
import { CreateClienteUseCase } from '../Application/UseCases/Cliente/CreateClienteUseCase';
import { LoginUseCase } from '../Application/UseCases/User/LoginUserUseCase';
import { RegisterUseCase } from '../Application/UseCases/User/RegisterUserUseCase';
import { S3Service } from '../Domain/Services/S3Service';
import { TokenService } from '../Domain/Services/TokenService';
import { DatabaseConnection } from '../infrastructure/Database/mongo/DatabaseConnection';
import { MongoClienteRepository } from '../infrastructure/Database/mongo/MongoClienteRepository';
import { MongoUserRepository } from '../infrastructure/Database/mongo/MongoUserRepository';
import { BcryptPasswordHasher } from '../infrastructure/Services/BcryptPasswordHasher';
import { JwtTokenService } from '../infrastructure/Services/JwtTokenService';
import { S3UploaderService } from '../infrastructure/Services/S3Uploader';
import { ClienteController } from '../Presentation/Controllers/ClienteController';
import { UserController } from '../Presentation/Controllers/UserController';
import { ClienteRoutes } from '../Presentation/Routes/ClienteRoutes';
import { UserRoutes } from '../Presentation/Routes/UserRoutes';

export class Container {
  private static instance: Container;
  private databaseConnection: DatabaseConnection;
  // Repositories
  private userRepository: MongoUserRepository | null = null;
  private clienteRepository: MongoClienteRepository | null = null; // Assuming you have a similar repository for Cliente

  // Use Cases
  private registerUseCase: RegisterUseCase | null = null;
  private loginUseCase: LoginUseCase | null = null;
  private createClienteUseCase: CreateClienteUseCase | null = null; // Assuming you have a use case for creating Cliente

  private userController: UserController | null = null;
  private userRoutes: UserRoutes | null = null;

  private clientesController: ClienteController | null = null;
  private clienteRoutes: ClienteRoutes | null = null;

  // Services
  private passwordHasher: BcryptPasswordHasher | null = null;
  private tokenService: TokenService | null = null;

  private constructor() {
    this.databaseConnection = new DatabaseConnection();
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  async initialize(connectionString: string, databaseName: string, secret: string, region: string, accessKeyId: string, secretAccessKey: string, bucketName: string, session_token: string): Promise<void> {
    const database = await this.databaseConnection.connect(connectionString, databaseName);
    const s3Service = new S3UploaderService(region, accessKeyId, secretAccessKey, bucketName, session_token); // Assuming you have a service for S3 uploads

    // Services
    this.passwordHasher = new BcryptPasswordHasher();
    this.tokenService = new JwtTokenService(secret, 3900);

    // Repositories
    this.userRepository = new MongoUserRepository(database);
    this.clienteRepository = new MongoClienteRepository(database); // Assuming you have a similar repository for Cliente

    // Use Cases
    this.registerUseCase = new RegisterUseCase(this.userRepository, this.passwordHasher);
    this.loginUseCase = new LoginUseCase(this.userRepository, this.passwordHasher, this.tokenService);
    this.createClienteUseCase = new CreateClienteUseCase(
      this.clienteRepository,
      s3Service
    );

    // Controllers
    this.userController = new UserController(
      this.registerUseCase,
      this.loginUseCase
    );
    this.clientesController = new ClienteController(
      this.createClienteUseCase
    );

    // Routes
    this.userRoutes = new UserRoutes(this.userController);
    this.clienteRoutes = new ClienteRoutes(
      this.clientesController,
      this.tokenService
    );
  }

  getUserRoutes(): UserRoutes {
    if (!this.userRoutes) {
      throw new Error('Contenedor no inicializado');
    }
    return this.userRoutes;
  }

  getClienteRoutes(): ClienteRoutes {
    if (!this.clienteRoutes) {
      throw new Error('Contenedor no inicializado');
    }
    return this.clienteRoutes;
  }

  async shutdown(): Promise<void> {
    await this.databaseConnection.disconnect();
  }
}