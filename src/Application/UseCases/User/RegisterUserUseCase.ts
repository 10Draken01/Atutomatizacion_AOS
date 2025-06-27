import { User } from "../../../Domain/Entities/User";
import { UserRepository } from "../../../Domain/Repositories/UserRepository";
import { PasswordHasher } from "../../../Domain/Services/PasswordHasher";
import { Email } from "../../../Domain/ValueObjects/Email";
import { Password } from "../../../Domain/ValueObjects/Password";
import { Id } from "../../../Domain/ValueObjects/UserId";
import { Username } from "../../../Domain/ValueObjects/Username";
import { RegisterRequest } from "../../DTOs/Register/RegisterRequest";
import { RegisterResponse } from "../../DTOs/Register/RegisterResponse";
import { UserAlreadyExistsException } from "../../Exceptions/UserAlreadyExistsException";


export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher // Asegúrate de inyectar un hasher de contraseñas
  ) {}

  async execute(request: RegisterRequest): Promise<RegisterResponse> {
    // Validar datos de entrada usando Value Objects
    const userId = new Id();
    const username = new Username(request.username);
    const email = new Email(request.email);
    const password = await Password.create(request.password, this.passwordHasher); // En un caso real, deberías hashear la contraseña

    // Verificar que el usuario no exista
    const existingUser = await this.userRepository.findByEmail(email.getValue());
    if (existingUser) {
      throw new UserAlreadyExistsException(email.getValue());
    }

    // Crear el usuario
    const user: User = {
      id: userId.getValue(),
      username: username.getValue(),
      email: email.getValue(),
      password: password.getValue(), // En un caso real, deberías hashear la contraseña
    };

    // Guardar el usuario
    await this.userRepository.save(user);

    // Retornar respuesta
    return {
      id: user.id,
      email: user.email,
      username: user.username
    };
  }
}