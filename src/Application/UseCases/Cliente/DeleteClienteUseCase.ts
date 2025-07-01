import { ClienteRepository } from "../../../Domain/Repositories/ClienteRepository";
import { DriveService } from "../../../Domain/Services/DriveService";
import { Clave_Cliente } from "../../../Domain/ValueObjects/Clave_Cliente";
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
        const clave_cliente = new Clave_Cliente(request.clave_cliente);

        // Obtener el cliente por clave_cliente
        const cliente = await this.clienteRepository.deleteByClaveCliente(clave_cliente.getValue());

        if (!cliente) {
            throw new ClienteNotExistsException(clave_cliente.getValue());
        }

        // Si el cliente tiene un character_icon, eliminarlo del servicio de Drive
        if (cliente.character_icon && typeof cliente.character_icon === 'object' && 'id' in cliente.character_icon) {
            // Asumimos que character_icon es un objeto con un id
            await this.driveService.deleteImageFromDrive(cliente.character_icon.id);
        }

        // Retornar respuesta
        return {
            message: `Cliente con clave ${clave_cliente.getValue()} eliminado correctamente.`,
            cliente: {
                id: cliente.id,
                clave_cliente: cliente.clave_cliente,
                nombre: cliente.nombre,
                celular: cliente.celular,
                email: cliente.email,
                character_icon: cliente.character_icon, // Asumimos que es un número o string
                created_at: cliente.created_at,
                updated_at: cliente.updated_at
            }
        };
    }
}