import { CharacterIcontype } from "./CharacterIcontype";


export interface ClienteUpdated {
  claveCliente: string;
  nombre?: string;
  celular?: string;
  email?: string;
  characterIcon?: number | CharacterIcontype;
  createdAt: Date;
  updatedAt: Date;
}