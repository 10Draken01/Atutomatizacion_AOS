export class ClienteNotExistsException extends Error {
  constructor(clave_cliente: string) {
    super(`Cliente con clave ${clave_cliente} no existe.`);
    this.name = 'ClienteNotExistsException';
  }
}