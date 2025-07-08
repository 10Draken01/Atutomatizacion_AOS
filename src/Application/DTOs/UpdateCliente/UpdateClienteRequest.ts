export interface UpdateClienteRequest {
  claveCliente: number | string;
  nombre?: string;
  celular?: string;
  email?: string;
  characterIcon?: any;
}