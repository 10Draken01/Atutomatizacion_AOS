
import { LoginUseCase } from '../Application/UseCases/LoginUserUseCase';
import { RegisterUseCase } from '../Application/UseCases/RegisterUserUseCase';
import { TokenService } from '../Domain/Services/TokenService';
import { DatabaseConnection } from '../Infrastructure/Database/mongo/DatabaseConnection';
import { MongoUserRepository } from '../Infrastructure/Database/mongo/MongoUserRepository';
import { BcryptPasswordHasher } from '../Infrastructure/Services/BcryptPasswordHasher';
import { JwtTokenService } from '../Infrastructure/Services/JwtTokenService';
import { UserController } from '../Presentation/Controllers/UserController';
import { UserRoutes } from '../Presentation/Routes/UserRoutes';

export class Container {
  private static instance: Container;
  private databaseConnection: DatabaseConnection;
  private userRepository: MongoUserRepository | null = null;
  private registerUseCase: RegisterUseCase | null = null;
  private loginUseCase: LoginUseCase | null = null;
  private userController: UserController | null = null;
  private userRoutes: UserRoutes | null = null;
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

  async initialize(connectionString: string, databaseName: string, secret: string): Promise<void> {
    const database = await this.databaseConnection.connect(connectionString, databaseName);

    // Services
    this.passwordHasher = new BcryptPasswordHasher();
    this.tokenService = new JwtTokenService(secret, 3900);

    // Repositories
    this.userRepository = new MongoUserRepository(database);

    // Use Cases
    this.registerUseCase = new RegisterUseCase(this.userRepository, this.passwordHasher);
    this.loginUseCase = new LoginUseCase(this.userRepository, this.passwordHasher, this.tokenService);

    // Controllers
    this.userController = new UserController(
      this.registerUseCase,
      this.loginUseCase
    );

    // Routes
    this.userRoutes = new UserRoutes(this.userController);
  }

  getUserRoutes(): UserRoutes {
    if (!this.userRoutes) {
      throw new Error('Container not initialized');
    }
    return this.userRoutes;
  }

  async shutdown(): Promise<void> {
    await this.databaseConnection.disconnect();
  }
}