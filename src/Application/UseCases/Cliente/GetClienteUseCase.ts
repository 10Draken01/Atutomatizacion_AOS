import { ClienteRepository } from "../../../Domain/Repositories/ClienteRepository";
import { DriveService } from "../../../Domain/Services/DriveService";
import { Clave_Cliente } from "../../../Domain/ValueObjects/Clave_Cliente";
import { Page } from "../../../Domain/ValueObjects/Page";
import { GetClienteRequest } from "../../DTOs/GetCliente/GetClienteRequest";
import { GetClienteResponse } from "../../DTOs/GetCliente/GetClienteResponse";
import { GetPageClientesRequest } from "../../DTOs/GetPageClientes/GetPageClientesRequest";
import { GetPageClientesResponse } from "../../DTOs/GetPageClientes/GetPageClientesResponse";
import { ClienteNotExistsException } from "../../Exceptions/ClienteNotExistsException";


export class GetClienteUseCase {
    constructor(
        private readonly clienteRepository: ClienteRepository
    ) { }

    async execute(request: GetClienteRequest): Promise<GetClienteResponse> {
        // Validar datos de entrada usando Value Objects
        const clave_cliente = new Clave_Cliente(request.clave_cliente);

        // Obtener el cliente por clave_cliente
        const cliente = await this.clienteRepository.findByClaveCliente(clave_cliente.getValue());

        if (!cliente) {
            throw new ClienteNotExistsException(clave_cliente.getValue());
        }
        // Retornar respuesta
        return {
            id: cliente.id,
            clave_cliente: cliente.clave_cliente,
            nombre: cliente.nombre,
            celular: cliente.celular,
            email: cliente.email,
            character_icon: cliente.character_icon, // Asumimos que es un número o string
            created_at: cliente.created_at,
            updated_at: cliente.updated_at
        };
    }
}