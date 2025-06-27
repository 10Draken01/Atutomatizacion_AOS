import { User } from "../../Domain/Entities/User";
import { UserRepository } from "../../Domain/Repositories/UserRepository";
import { PasswordHasher } from "../../Domain/Services/PasswordHasher";
import { TokenService } from "../../Domain/Services/TokenService";
import { Email } from "../../Domain/ValueObjects/Email";
import { Password } from "../../Domain/ValueObjects/Password";
import { UserId } from "../../Domain/ValueObjects/UserId";
import { Username } from "../../Domain/ValueObjects/Username";
import { LoginRequest } from "../DTOs/Login/LoginRequest";
import { LoginResponse } from "../DTOs/Login/LoginResponse";
import { RegisterRequest } from "../DTOs/Register/RegisterRequest";
import { RegisterResponse } from "../DTOs/Register/RegisterResponse";
import { UserAlreadyExistsException } from "../Exceptions/UserAlreadyExistsException";
import { UserNotExistsException } from "../Exceptions/UserNotExistsException";


export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher, // Asegúrate de inyectar un hasher de contraseñas
    private readonly tokenService: TokenService // Aquí deberías inyectar un servicio de generación de tokens JWT
  ) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    // Validar datos de entrada usando Value Objects
    const email = new Email(request.email);

    // Verificar que el usuario no exista
    const existingUser = await this.userRepository.findByEmail(email.getValue());
    if (!existingUser) {
      throw new UserNotExistsException(email.getValue());
    }

    if (await Password.validate(request.password, existingUser.password, this.passwordHasher) === false) {
      throw new Error('Contraseña incorrecta');
    }

    const tokenPayload = {
      id: existingUser.id,
      username: existingUser.username,
      email: email.getValue(),
    }

    const token = await this.tokenService.generateToken(tokenPayload);

    // Retornar respuesta
    return {
      id: existingUser.id,
      username: existingUser.username,
      email: email.getValue(),
      token: token, // Aquí deberías generar un token JWT
      expiresIn: 3600, // Por ejemplo, 1 hora
    };
  }
}