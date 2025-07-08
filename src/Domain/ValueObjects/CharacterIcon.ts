import { CharacterIcontype } from "../Entities/CharacterIcontype";

export class CharacterIcon {
  private readonly value: number | CharacterIcontype;

  constructor(characterIcon: number | CharacterIcontype) {
    if (typeof characterIcon !== 'number' && typeof characterIcon !== 'object') {
      throw new Error('El icono del personaje debe ser una cadena o un CharacterIcontype');
    }
    if (typeof characterIcon === 'object' && !('id' in characterIcon && 'url' in characterIcon)) {
      throw new Error('El objeto CharacterIcontype debe tener las propiedades id y url');
    }

    this.value = characterIcon;
  }

  getValue(): number | CharacterIcontype {
    return this.value;
  }
}