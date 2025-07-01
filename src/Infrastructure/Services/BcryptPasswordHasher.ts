import * as bcrypt from 'bcrypt';
import { PasswordHasher } from '../../Domain/Services/PasswordHasher';

export class BcryptPasswordHasher implements PasswordHasher {
  private readonly saltRounds = 12;

  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    // Compara la contraseña proporcionada con el hash almacenado
    // Si la contraseña coincide, devuelve true; de lo contrario, devuelve false
    return await bcrypt.compare(password, hashedPassword);
  }
}