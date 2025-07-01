export interface UpdateClienteRequest {
  clave_cliente: number | string;
  nombre?: string;
  celular?: string;
  email?: string;
  character_icon?: any;
}