import { Cliente } from "../../../Domain/Entities/Cliente";

export interface GetPageClientesResponse {
  clientes: Cliente[];
  totalDocuments: number;
}