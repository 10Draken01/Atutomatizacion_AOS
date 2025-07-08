
export class ClaveCliente {
  private readonly value: string;

  constructor(claveCliente: string | number) {
    const claveClienteStr = claveCliente.toString();
    if (!this.isValid(claveClienteStr)) {
      throw new Error('Formato de clave de cliente inválido');
    }
    this.value = claveClienteStr;
  }

  getValue(): string {
    return this.value;
  }

  private isValid(claveCliente: string): boolean {
    // tiene que tene solo caracteres numericos
    const claveClienteRegex = /^[0-9]+$/;
    return claveClienteRegex.test(claveCliente);
  }
}