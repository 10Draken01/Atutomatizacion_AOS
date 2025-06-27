export class UserAlreadyExistsException extends Error {
  constructor(email: string) {
    super(`Usuario con email ${email} ya existe.`);
    this.name = 'UserAlreadyExistsException';
  }
}