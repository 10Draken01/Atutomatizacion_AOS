import { Character_Icon_type } from "../../../Domain/Entities/Character_Icon_type";

export interface UpdateClienteResponse {
  id: string;
  clave_cliente: number | string;
  nombre: string;
  celular: string;
  email: string;
  character_icon: number | Character_Icon_type;
  created_at: Date;
  updated_at: Date;
}