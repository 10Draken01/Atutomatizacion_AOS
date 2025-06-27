import jwt from 'jsonwebtoken';
import { TokenService } from '../../Domain/Services/TokenService';

export class JwtTokenService implements TokenService {
  private readonly secret: string;
  private readonly expiresIn: number;

  constructor(secret: string, expiresIn: number) {
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  async generateToken(payload: any): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(
        payload,
        this.secret,
        {
          expiresIn: this.expiresIn,
          issuer: 'your-app-name',
          audience: 'your-app-users'
        },
        (error, token) => {
          if (error) {
            reject(error);
          } else {
            resolve(token as string);
          }
        }
      );
    });
  }

  async verifyToken(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.secret, (error, decoded) => {
        if (error) {
          reject(new Error('Invalid or expired token'));
        } else {
          resolve(decoded);
        }
      });
    });
  }

  async refreshToken(token: string): Promise<string> {
    const decoded = await this.verifyToken(token);
    // Remover campos específicos de JWT antes de regenerar
    const { iat, exp, ...payload } = decoded;
    return this.generateToken(payload);
  }
}