
export class Clave_Cliente {
  private readonly value: string;

  constructor(clave_cliente: string | number) {
    const clave_clienteStr = clave_cliente.toString();
    if (!this.isValid(clave_clienteStr)) {
      throw new Error('Formato de clave de cliente inválido');
    }
    this.value = clave_clienteStr;
  }

  getValue(): string {
    return this.value;
  }

  private isValid(clave_cliente: string): boolean {
    // tiene que tene solo caracteres numericos
    const claveClienteRegex = /^[0-9]+$/;
    return claveClienteRegex.test(clave_cliente);
  }
}