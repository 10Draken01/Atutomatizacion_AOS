import { InvalidPasswordException } from "../../Application/Exceptions/InvalidPasswordException";

export class Password {
  private value: string;

  constructor(plainPassword: string) {
    if (!plainPassword || plainPassword.trim().length < 6) {
      throw new InvalidPasswordException('La contraseña debe tener al menos 6 caracteres');
    }
    if (plainPassword.length > 10) {
      throw new InvalidPasswordException('La contraseña no puede tener más de 10 caracteres');
    }

    this.value = plainPassword;
  }

  setHashedPassword(hashedPassword: string): void {
    if (!hashedPassword || hashedPassword.trim().length === 0) {
      throw new InvalidPasswordException('El hash de la contraseña no puede estar vacío');
    }
    this.value = hashedPassword;
  }

  getValue(): string {
    return this.value;
  }
}