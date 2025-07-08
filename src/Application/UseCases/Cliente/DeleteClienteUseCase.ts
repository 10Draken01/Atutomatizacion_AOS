import { ClienteRepository } from "../../../Domain/Repositories/ClienteRepository";
import { DriveService } from "../../../Domain/Services/DriveService";
import { ClaveCliente } from "../../../Domain/ValueObjects/ClaveCliente";
import { Page } from "../../../Domain/ValueObjects/Page";
import { DeleteClienteRequest } from "../../DTOs/DeleteCliente/DeleteClienteRequest";
import { DeleteClienteResponse } from "../../DTOs/DeleteCliente/DeleteClienteResponse";
import { GetClienteRequest } from "../../DTOs/GetCliente/GetClienteRequest";
import { GetClienteResponse } from "../../DTOs/GetCliente/GetClienteResponse";
import { GetPageClientesRequest } from "../../DTOs/GetPageClientes/GetPageClientesRequest";
import { GetPageClientesResponse } from "../../DTOs/GetPageClientes/GetPageClientesResponse";
import { ClienteNotExistsException } from "../../Exceptions/ClienteNotExistsException";


export class DeleteClienteUseCase {
    constructor(
        private readonly clienteRepository: ClienteRepository,
        private readonly driveService: DriveService 
    ) { }

    async execute(request: DeleteClienteRequest): Promise<DeleteClienteResponse> {
        // Validar datos de entrada usando Value Objects
        const claveCliente = new ClaveCliente(request.claveCliente);

        // Obtener el cliente por clave_cliente
        const cliente = await this.clienteRepository.deleteByClaveCliente(claveCliente.getValue());

        if (!cliente) {
            throw new ClienteNotExistsException(claveCliente.getValue());
        }

        // Si el cliente tiene un characterIcon, eliminarlo del servicio de Drive
        if (cliente.characterIcon && typeof cliente.characterIcon === 'object' && 'id' in cliente.characterIcon) {
            // Asumimos que characterIcon es un objeto con un id
            await this.driveService.deleteImageFromDrive(cliente.characterIcon.id);
        }

        // Retornar respuesta
        return {
            message: `Cliente con clave ${claveCliente.getValue()} eliminado correctamente.`,
            cliente: {
                id: cliente.id,
                claveCliente: cliente.claveCliente,
                nombre: cliente.nombre,
                celular: cliente.celular,
                email: cliente.email,
                characterIcon: cliente.characterIcon, // Asumimos que es un número o string
                createdAt: cliente.createdAt,
                updatedAt: cliente.updatedAt
            }
        };
    }
}