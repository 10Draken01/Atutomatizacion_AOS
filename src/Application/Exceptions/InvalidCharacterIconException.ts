export class InvalidCharacterIconException extends Error {
  constructor(character_icon: string) {
    super(`El character_icon "${character_icon}" no es válido. Debe ser un número del 0 al 9.`);
    this.name = 'InvalidCharacterIconException';
  }
}