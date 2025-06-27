export class Nombre {
  private readonly value: string;

  constructor(name: string) {
    if (!name || name.trim().length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres');
    }
    if (name.length > 100) {
      throw new Error('El nombre no puede tener más de 100 caracteres');
    }
    this.value = name.trim();
  }

  getValue(): string {
    return this.value;
  }
}