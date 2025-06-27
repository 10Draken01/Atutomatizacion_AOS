import { Cliente } from "../../../Domain/Entities/Cliente";
import { ClienteRepository } from "../../../Domain/Repositories/ClienteRepository";
import { S3Service } from "../../../Domain/Services/S3Service";
import { Celular } from "../../../Domain/ValueObjects/Celular";
import { Character_Icon } from "../../../Domain/ValueObjects/Character_Icon";
import { Clave_Cliente } from "../../../Domain/ValueObjects/Clave_Cliente";
import { Email } from "../../../Domain/ValueObjects/Email";
import { Nombre } from "../../../Domain/ValueObjects/Nombre";
import { Id } from "../../../Domain/ValueObjects/UserId";
import { CreateClienteRequest } from "../../DTOs/CreateCliente/CreateClienteRequest";
import { CreateClienteResponse } from "../../DTOs/CreateCliente/CreateClienteResponse";
import { ClienteAlreadyExistsException } from "../../Exceptions/ClienteAlreadyExistsException";


export class CreateClienteUseCase {
    constructor(
        private readonly clienteRepository: ClienteRepository,
        private readonly s3Service: S3Service // Asumimos que tienes un servicio para manejar S3
    ) { }

    async execute(request: CreateClienteRequest): Promise<CreateClienteResponse> {
        // Validar datos de entrada usando Value Objects
        const id = new Id()
        const claveCliente = new Clave_Cliente(request.clave_cliente);
        const nombre = new Nombre(request.nombre);
        const celular = new Celular(request.celular); // Asumimos que el celular es
        const email = new Email(request.email);

        // Verificar que el cliente no exista
        const existingCliente = await this.clienteRepository.findByClaveCliente(claveCliente.getValue());

        if (existingCliente) {
            throw new ClienteAlreadyExistsException(claveCliente.getValue());
        }

        // Verificar que character_icon sea un file
        let character_icon: Character_Icon = new Character_Icon(0); // Valor por defecto
        if (request.character_icon.typeof === 'string' || request.character_icon.typeof === 'number') {
            character_icon = new Character_Icon(request.character_icon);
        } else {
            character_icon = new Character_Icon(await this.s3Service.uploadFile(request.character_icon, claveCliente.getValue()));
        }

        const newCliente: Cliente = {
            id: id.getValue(), // Generar un ID único
            clave_cliente: claveCliente.getValue(),
            nombre: nombre.getValue(),
            celular: celular.getValue(),
            email: email.getValue(),
            character_icon: character_icon.getValue(), // Asumimos que es un número o string
        }

        await this.clienteRepository.save(newCliente);

        // Retornar respuesta
        return {
            id: newCliente.id,
            clave_cliente: newCliente.clave_cliente,
            nombre: newCliente.nombre,
            email: newCliente.email,
            celular: newCliente.celular,
            character_icon: newCliente.character_icon,
        };
    }
}