
import { Cliente } from "../Entities/Cliente";

export interface ClienteRepository {
  save(cliente: Cliente): Promise<void>;
  findByClaveCliente(clave_cliente: string): Promise<Cliente | null>;
  deleteByClaveCliente(clave_cliente: string): Promise<boolean>;
  update(cliente: Cliente): Promise<Cliente | null>;
}
