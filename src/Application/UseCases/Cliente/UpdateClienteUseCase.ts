import { Cliente } from "../../../Domain/Entities/Cliente";
import { ClienteUpdated } from "../../../Domain/Entities/ClienteUpdated";
import { ClienteRepository } from "../../../Domain/Repositories/ClienteRepository";
import { DriveService } from "../../../Domain/Services/DriveService";
import { Celular } from "../../../Domain/ValueObjects/Celular";
import { Character_Icon } from "../../../Domain/ValueObjects/Character_Icon";
import { Clave_Cliente } from "../../../Domain/ValueObjects/Clave_Cliente";
import { Email } from "../../../Domain/ValueObjects/Email";
import { Nombre } from "../../../Domain/ValueObjects/Nombre";
import { UpdateClienteRequest } from "../../DTOs/UpdateCliente/UpdateClienteRequest";
import { UpdateClienteResponse } from "../../DTOs/UpdateCliente/UpdateClienteResponse";
import { ClienteNotExistsException } from "../../Exceptions/ClienteNotExistsException";
import { InvalidCharacterIconException } from "../../Exceptions/InvalidCharacterIconException";


export class UpdateClienteUseCase {
    constructor(
        private readonly clienteRepository: ClienteRepository,
        private readonly driveService: DriveService // Asumimos que tienes un servicio para manejar S3
    ) { }

    async execute(request: UpdateClienteRequest): Promise<UpdateClienteResponse> {
        // Validar datos de entrada usando Value Objects
        const claveCliente = new Clave_Cliente(request.clave_cliente);
        // Verificar que el cliente no exista
        const existingCliente = await this.clienteRepository.findByClaveCliente(claveCliente.getValue());

        if (!existingCliente) {
            throw new ClienteNotExistsException(claveCliente.getValue());
        }

        if (request.character_icon) {
            // Verificar que character_icon sea un file
            if (typeof existingCliente.character_icon === "object") {
                // Borrar la imagen de drive si es un objeto
                if (existingCliente.character_icon.id) {
                    await this.driveService.deleteImageFromDrive(existingCliente.character_icon.id);
                }
            }
            if (typeof request.character_icon === 'string') {
                // Convertir a Number y que sea del 0 al 9 1 caracter
                const regexNumeric09 = /^[0-9]{1}$/;
                if (!regexNumeric09.test(request.character_icon)) {
                    throw new InvalidCharacterIconException(request.character_icon);
                }
                request.character_icon = new Character_Icon(Number(request.character_icon));
            } else if(typeof request.character_icon === 'number'){
                if (request.character_icon < 0 || request.character_icon > 9) {
                    throw new InvalidCharacterIconException(request.character_icon.toString());
                }
                request.character_icon = new Character_Icon(request.character_icon);
            } else {
                const { fileId, imageUrl } = await this.driveService.uploadImageToDrive(request.character_icon, claveCliente.getValue());
                request.character_icon = new Character_Icon({
                    id: fileId,
                    url: imageUrl
                });
            }
        }

        const clienteToUpdate: ClienteUpdated | null = {
            clave_cliente: claveCliente.getValue(),
            nombre: request.nombre,
            celular: request.celular,
            email: request.email,
            character_icon: request.character_icon.getValue(), // Mantener el mismo character_icon
            created_at: existingCliente.created_at, // Mantener la fecha de creación
            updated_at: new Date(), // Actualizar la fecha de actualización
        }

        console.log(`Cliente a actualizar: ${JSON.stringify(clienteToUpdate)}`);

        const clienteUpdated = await this.clienteRepository.updateCliente(clienteToUpdate);

        if (!clienteUpdated) {
            throw new ClienteNotExistsException(claveCliente.getValue());
        }

        // Retornar respuesta
        return {
            id: clienteUpdated.id,
            clave_cliente: clienteUpdated.clave_cliente,
            nombre: clienteUpdated.nombre,
            email: clienteUpdated.email,
            celular: clienteUpdated.celular,
            character_icon: clienteUpdated.character_icon,
            created_at: clienteUpdated.created_at,
            updated_at: clienteUpdated.updated_at,
        };
    }
}