import { ClienteRepository } from "../../../Domain/Repositories/ClienteRepository";
import { DriveService } from "../../../Domain/Services/DriveService";
import { ClaveCliente } from "../../../Domain/ValueObjects/ClaveCliente";
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
        const claveCliente = new ClaveCliente(request.claveCliente);

        // Obtener el cliente por claveCliente
        const cliente = await this.clienteRepository.findByClaveCliente(claveCliente.getValue());

        if (!cliente) {
            throw new ClienteNotExistsException(claveCliente.getValue());
        }
        // Retornar respuesta
        return {
            id: cliente.id,
            claveCliente: cliente.claveCliente,
            nombre: cliente.nombre,
            celular: cliente.celular,
            email: cliente.email,
            characterIcon: cliente.characterIcon, // Asumimos que es un número o string
            createdAt: cliente.createdAt,
            updatedAt: cliente.updatedAt
        };
    }
}