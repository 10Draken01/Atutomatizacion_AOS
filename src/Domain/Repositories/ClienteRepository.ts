
import { Cliente } from "../Entities/Cliente";
import { ClienteUpdated } from "../Entities/ClienteUpdated";

export interface ClienteRepository {
  createCliente(cliente: Cliente): Promise<void>;
  findByClaveCliente(clave_cliente: string): Promise<Cliente | null>;
  deleteByClaveCliente(clave_cliente: string): Promise<Cliente | null>;
  updateCliente(cliente: ClienteUpdated): Promise<Cliente | null>;
  getPageClientes(page: number): Promise<{ clientes: Cliente[]; totalDocuments: number }>;
  getTotalPages(): Promise<number>;
}
