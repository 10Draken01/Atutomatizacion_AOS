import { Character_Icon_type } from "../Entities/Character_Icon_type";

export class Character_Icon {
  private readonly value: number | Character_Icon_type;

  constructor(character_icon: number | Character_Icon_type) {
    if (typeof character_icon !== 'number' && typeof character_icon !== 'object') {
      throw new Error('El icono del personaje debe ser una cadena o un Character_Icon_type');
    }
    if (typeof character_icon === 'object' && !('id' in character_icon && 'url' in character_icon)) {
      throw new Error('El objeto Character_Icon_type debe tener las propiedades id y url');
    }

    this.value = character_icon;
  }

  getValue(): number | Character_Icon_type {
    return this.value;
  }
}