import { ClienteRepository } from "../../../Domain/Repositories/ClienteRepository";
import { DriveService } from "../../../Domain/Services/DriveService";
import { Page } from "../../../Domain/ValueObjects/Page";
import { GetPageClientesRequest } from "../../DTOs/GetPageClientes/GetPageClientesRequest";
import { GetPageClientesResponse } from "../../DTOs/GetPageClientes/GetPageClientesResponse";


export class GetPageClientesUseCase {
    constructor(
        private readonly clienteRepository: ClienteRepository
    ) { }

    async execute(request: GetPageClientesRequest): Promise<GetPageClientesResponse> {
        // Validar datos de entrada usando Value Objects
        const totalPages = await this.clienteRepository.getTotalPages();
        const page = new Page(request.page, totalPages);

        // Obtener la lista de clientes con paginación
        const { clientes, totalDocuments } = await this.clienteRepository.getPageClientes(page.getValue());
        // Retornar respuesta
        return {
            clientes: clientes,
            totalDocuments: totalDocuments,
        };
    }
}