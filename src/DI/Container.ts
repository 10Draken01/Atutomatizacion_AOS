
import { CreateClienteUseCase } from '../Application/UseCases/Cliente/CreateClienteUseCase';
import { DeleteClienteUseCase } from '../Application/UseCases/Cliente/DeleteClienteUseCase';
import { GetClienteUseCase } from '../Application/UseCases/Cliente/GetClienteUseCase';
import { GetPageClientesUseCase } from '../Application/UseCases/Cliente/GetPageClientesUseCase';
import { UpdateClienteUseCase } from '../Application/UseCases/Cliente/UpdateClienteUseCase';
import { LoginUseCase } from '../Application/UseCases/User/LoginUserUseCase';
import { RegisterUseCase } from '../Application/UseCases/User/RegisterUserUseCase';
import { TokenService } from '../Domain/Services/TokenService';
import { DatabaseConnection } from '../Infrastructure/Database/mongo/DatabaseConnection';
import { MongoClienteRepository } from '../Infrastructure/Database/mongo/MongoClienteRepository';
import { MongoUserRepository } from '../Infrastructure/Database/mongo/MongoUserRepository';
import { BcryptPasswordHasher } from '../Infrastructure/Services/BcryptPasswordHasher';
import { DriveApi } from '../Infrastructure/Services/DriveApi';
import { JwtTokenService } from '../Infrastructure/Services/JwtTokenService';
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
  private updateClienteUseCase: UpdateClienteUseCase | null = null; // Assuming you have a use case for updating Cliente
  private getPageClientesUseCase: GetPageClientesUseCase | null = null; // Assuming you have a use case for getting paginated Clientes
  private getClienteUseCase: GetClienteUseCase | null = null; // Assuming you have a use case for getting a specific Cliente
  private deleteClienteUseCase: DeleteClienteUseCase | null = null;

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

  async initialize(connectionString: string, databaseName: string, secret: string, folderId: string): Promise<void> {
    const database = await this.databaseConnection.connect(connectionString, databaseName);
    const driveService = new DriveApi(folderId)

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
      driveService
    );
    this.updateClienteUseCase = new UpdateClienteUseCase(
      this.clienteRepository,
      driveService
    );
    this.getPageClientesUseCase = new GetPageClientesUseCase(
      this.clienteRepository
    );
    this.getClienteUseCase = new GetClienteUseCase(
      this.clienteRepository
    );
    this.deleteClienteUseCase = new DeleteClienteUseCase(
      this.clienteRepository,
      driveService
    );


    // Controllers
    this.userController = new UserController(
      this.registerUseCase,
      this.loginUseCase
    );
    this.clientesController = new ClienteController(
      this.createClienteUseCase,
      this.updateClienteUseCase,
      this.getPageClientesUseCase,
      this.getClienteUseCase,
      this.deleteClienteUseCase
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