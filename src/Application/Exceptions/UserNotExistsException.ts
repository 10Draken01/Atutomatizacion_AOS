export class UserNotExistsException extends Error {
  constructor(email: string) {
    super(`Usuario con email ${email} no existe.`);
    this.name = 'UserNotExistsException';
  }
}