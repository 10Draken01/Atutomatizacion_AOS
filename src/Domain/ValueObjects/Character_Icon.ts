export class Character_Icon {
  private readonly value: string | number;

  constructor(character_icon: string | number) {
    if (typeof character_icon !== 'string' && typeof character_icon !== 'number') {
      throw new Error('El icono del personaje debe ser una cadena o un número');
    }
    this.value = character_icon;
  }

  getValue(): string | number {
    return this.value;
  }
}