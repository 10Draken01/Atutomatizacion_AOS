import { Cliente } from "../../../Domain/Entities/Cliente";

export interface DeleteClienteResponse {
  message: string;
  cliente: Cliente
}