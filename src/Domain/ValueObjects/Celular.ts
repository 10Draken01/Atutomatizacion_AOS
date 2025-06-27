export class Celular {
  private readonly value: string;

  constructor(celular: string) {
    if (!celular || celular.trim().length != 10) {
      throw new Error('El nombre debe tener al menos 10 caracteres');
    }
    this.value = celular.trim();
  }

  getValue(): string {
    return this.value;
  }
}