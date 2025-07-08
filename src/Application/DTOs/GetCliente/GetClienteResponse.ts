import { CharacterIcontype } from "../../../Domain/Entities/CharacterIcontype";

export interface GetClienteResponse {
  id: string;
  claveCliente: number | string;
  nombre: string;
  celular: string;
  email: string;
  characterIcon: number | CharacterIcontype;
  createdAt: Date;
  updatedAt: Date;
}