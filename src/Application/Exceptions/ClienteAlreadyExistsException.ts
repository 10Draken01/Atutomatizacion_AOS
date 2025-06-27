export class ClienteAlreadyExistsException extends Error {
  constructor(clave_cliente: string) {
    super(`Cliente con clave ${clave_cliente} ya existe.`);
    this.name = 'ClienteAlreadyExistsException';
  }
}