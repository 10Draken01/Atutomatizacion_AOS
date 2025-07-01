import { Cliente } from "../../../Domain/Entities/Cliente";
import { ClienteRepository } from "../../../Domain/Repositories/ClienteRepository";
import { DriveService } from "../../../Domain/Services/DriveService";
import { Celular } from "../../../Domain/ValueObjects/Celular";
import { Character_Icon } from "../../../Domain/ValueObjects/Character_Icon";
import { Clave_Cliente } from "../../../Domain/ValueObjects/Clave_Cliente";
import { Email } from "../../../Domain/ValueObjects/Email";
import { Nombre } from "../../../Domain/ValueObjects/Nombre";
import { Id } from "../../../Domain/ValueObjects/UserId";
import { CreateClienteRequest } from "../../DTOs/CreateCliente/CreateClienteRequest";
import { CreateClienteResponse } from "../../DTOs/CreateCliente/CreateClienteResponse";
import { ClienteAlreadyExistsException } from "../../Exceptions/ClienteAlreadyExistsException";
import { InvalidCharacterIconException } from "../../Exceptions/InvalidCharacterIconException";


export class CreateClienteUseCase {
    constructor(
        private readonly clienteRepository: ClienteRepository,
        private readonly driveService: DriveService 
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
        // Verificar que character_icon sea un file
        if (typeof request.character_icon === 'string') {
            // Convertir a Number y que sea del 0 al 9 1 caracter
            const regexNumeric09 = /^[0-9]{1}$/;
            if (!regexNumeric09.test(request.character_icon)) {
                throw new InvalidCharacterIconException(request.character_icon);
            }
            request.character_icon = new Character_Icon(Number(request.character_icon));
        } else if (typeof request.character_icon === 'number') {
            if (request.character_icon < 0 || request.character_icon > 9) {
                throw new InvalidCharacterIconException(request.character_icon.toString());
            }
            character_icon = new Character_Icon(request.character_icon);
        } else {
            const { fileId, imageUrl } = await this.driveService.uploadImageToDrive(request.character_icon, claveCliente.getValue());
            character_icon = new Character_Icon({
                id: fileId,
                url: imageUrl
            });
        }

        const date = new Date();

        const newCliente: Cliente = {
            id: id.getValue(), // Generar un ID único
            clave_cliente: claveCliente.getValue(),
            nombre: nombre.getValue(),
            celular: celular.getValue(),
            email: email.getValue(),
            character_icon: character_icon.getValue(), // Asumimos que es un número o string
            created_at: date, // Fecha de creación
            updated_at: date, // Fecha de actualización
        }

        await this.clienteRepository.createCliente(newCliente);

        // Retornar respuesta
        return {
            id: newCliente.id,
            clave_cliente: newCliente.clave_cliente,
            nombre: newCliente.nombre,
            email: newCliente.email,
            celular: newCliente.celular,
            character_icon: newCliente.character_icon,
            created_at: newCliente.created_at || new Date(),
            updated_at: newCliente.updated_at || new Date(),
        };
    }
}