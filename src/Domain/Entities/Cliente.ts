import { Character_Icon_type } from "./Character_Icon_type";


export interface Cliente {
  id: string;
  clave_cliente: string;
  nombre: string;
  celular: string;
  email: string;
  character_icon: number | Character_Icon_type;
  created_at: Date;
  updated_at: Date;
}