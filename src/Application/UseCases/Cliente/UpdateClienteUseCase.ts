import { Cliente } from "../../../Domain/Entities/Cliente";
import { ClienteUpdated } from "../../../Domain/Entities/ClienteUpdated";
import { ClienteRepository } from "../../../Domain/Repositories/ClienteRepository";
import { DriveService } from "../../../Domain/Services/DriveService";
import { Celular } from "../../../Domain/ValueObjects/Celular";
import { CharacterIcon } from "../../../Domain/ValueObjects/CharacterIcon";
import { ClaveCliente } from "../../../Domain/ValueObjects/ClaveCliente";
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
        const claveCliente = new ClaveCliente(request.claveCliente);
        // Verificar que el cliente no exista
        const existingCliente = await this.clienteRepository.findByClaveCliente(claveCliente.getValue());

        if (!existingCliente) {
            throw new ClienteNotExistsException(claveCliente.getValue());
        }

        if (request.characterIcon) {
            // Verificar que character_icon sea un file
            if (typeof existingCliente.characterIcon === "object") {
                // Borrar la imagen de drive si es un objeto
                if (existingCliente.characterIcon.id) {
                    await this.driveService.deleteImageFromDrive(existingCliente.characterIcon.id);
                }
            }
            if (typeof request.characterIcon === 'string') {
                // Convertir a Number y que sea del 0 al 9 1 caracter
                const regexNumeric09 = /^[0-9]{1}$/;
                if (!regexNumeric09.test(request.characterIcon)) {
                    throw new InvalidCharacterIconException(request.characterIcon);
                }
                request.characterIcon = new CharacterIcon(Number(request.characterIcon));
            } else if(typeof request.characterIcon === 'number'){
                if (request.characterIcon < 0 || request.characterIcon > 9) {
                    throw new InvalidCharacterIconException(request.characterIcon.toString());
                }
                request.characterIcon = new CharacterIcon(request.characterIcon);
            } else {
                const { fileId, imageUrl } = await this.driveService.uploadImageToDrive(request.characterIcon, claveCliente.getValue());
                request.characterIcon = new CharacterIcon({
                    id: fileId,
                    url: imageUrl
                });
            }
        }

        const clienteToUpdate: ClienteUpdated | null = {
            claveCliente: claveCliente.getValue(),
            nombre: request.nombre,
            celular: request.celular,
            email: request.email,
            characterIcon: request.characterIcon.getValue(), // Mantener el mismo character_icon
            createdAt: existingCliente.createdAt, // Mantener la fecha de creación
            updatedAt: new Date(), // Actualizar la fecha de actualización
        }

        console.log(`Cliente a actualizar: ${JSON.stringify(clienteToUpdate)}`);

        const clienteUpdated = await this.clienteRepository.updateCliente(clienteToUpdate);

        if (!clienteUpdated) {
            throw new ClienteNotExistsException(claveCliente.getValue());
        }

        // Retornar respuesta
        return {
            id: clienteUpdated.id,
            claveCliente: clienteUpdated.claveCliente,
            nombre: clienteUpdated.nombre,
            email: clienteUpdated.email,
            celular: clienteUpdated.celular,
            characterIcon: clienteUpdated.characterIcon,
            createdAt: clienteUpdated.createdAt,
            updatedAt: clienteUpdated.updatedAt,
        };
    }
}