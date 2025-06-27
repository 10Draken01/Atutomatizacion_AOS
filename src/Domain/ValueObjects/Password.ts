import { PasswordHasher } from "../Services/PasswordHasher";

export class Password {
  private readonly value: string;

  private constructor(hashedPassword: string) {
    this.value = hashedPassword;
  }

  static async create(password: string, passwordHasher: PasswordHasher): Promise<Password> {
    if (!password || password.trim().length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }
    if (password.length > 10) {
      throw new Error('La contraseña no puede tener más de 10 caracteres');
    }

    const hashedPassword = await passwordHasher.hash(password);
    return new Password(hashedPassword);
  }

  static async validate(password: string, hashedPassword: string, passwordHasher: PasswordHasher): Promise<boolean> {
    if (!password || password.trim().length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }
    if (password.length > 10) {
      throw new Error('La contraseña no puede tener más de 10 caracteres');
    }

    return await passwordHasher.compare(password, hashedPassword);
  }

  getValue(): string {
    return this.value;
  }
}
