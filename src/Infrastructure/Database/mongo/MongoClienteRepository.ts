import { MongoClient, Db, Collection } from 'mongodb';
import { User } from '../../../Domain/Entities/User';
import { ClienteRepository } from '../../../Domain/Repositories/ClienteRepository';
import { Cliente } from '../../../Domain/Entities/Cliente';
import { CharacterIcontype } from '../../../Domain/Entities/CharacterIcontype';

interface ClienteDocument {
  _id: string;
  claveCliente: string;
  nombre: string;
  celular: string;
  email: string;
  characterIcon: number | CharacterIcontype;
  createdAt: Date;
  updatedAt: Date;
}

export class MongoClienteRepository implements ClienteRepository {
  private readonly collection: Collection<ClienteDocument>;

  constructor(database: Db) {
    this.collection = database.collection<ClienteDocument>('clientes');
  }

  // Método helper para convertir documento a entidad
  private documentToEntity(document: ClienteDocument): Cliente {
    return {
      id: document._id,
      claveCliente: document.claveCliente,
      nombre: document.nombre,
      celular: document.celular,
      email: document.email,
      characterIcon: document.characterIcon,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt 
    };
  }

  // Método helper para convertir entidad a documento
  private entityToDocument(cliente: Cliente): ClienteDocument {
    const baseDocument: ClienteDocument = {
      _id: cliente.id,
      claveCliente: cliente.claveCliente,
      nombre: cliente.nombre,
      celular: cliente.celular,
      email: cliente.email,
      characterIcon: cliente.characterIcon,
      createdAt: cliente.createdAt,
      updatedAt: cliente.updatedAt
    };

    return baseDocument;
  }

  async createCliente(cliente: Cliente): Promise<void> {
    try {
      const document = this.entityToDocument(cliente);
      await this.collection.insertOne(document);
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error('Cliente ya existe con esa clave o email');
      }
      throw error;
    }
  }

  async findByClaveCliente(clave_cliente: string): Promise<Cliente | null> {
    const document = await this.collection.findOne({ clave_cliente: clave_cliente });
    return document ? this.documentToEntity(document) : null;
  }

  async deleteByClaveCliente(clave_cliente: string): Promise<Cliente | null> {
    const result = await this.collection.findOneAndDelete({ clave_cliente });

    if (!result) {
      return null; // No se encontró el cliente
    }
    return this.documentToEntity(result);
  }

  // MÉTODO UPDATE - Solo actualiza campos con valores válidos
  async updateCliente(cliente: Cliente): Promise<Cliente | null> {
    try {
      // Filtrar solo campos que no estén vacíos, null o undefined
      const updateFields: any = {
        updated_at: new Date() // Siempre actualizar timestamp
      };

      // Solo agregar campos si tienen valores válidos
      if (cliente.claveCliente != null && cliente.claveCliente.trim() !== '') {
        updateFields.claveCliente = cliente.claveCliente.trim();
      }

      if (cliente.nombre != null && cliente.nombre.trim() !== '') {
        updateFields.nombre = cliente.nombre.trim();
      }

      if (cliente.celular != null && cliente.celular.trim() !== '') {
        updateFields.celular = cliente.celular.trim();
      }

      if (cliente.email != null && cliente.email.trim() !== '') {
        updateFields.email = cliente.email.trim();
      }

      if (cliente.characterIcon != null) {
        updateFields.characterIcon = cliente.characterIcon;
      }

      updateFields.updatedAt = cliente.updatedAt;

      // Si no hay campos para actualizar (solo timestamp), no hacer nada
      if (Object.keys(updateFields).length === 1) {
        // Solo devolver el cliente existente sin cambios
        const existing = await this.collection.findOne({ claveCliente: cliente.claveCliente });
        return existing ? this.documentToEntity(existing) : null;
      }

      const result = await this.collection.findOneAndUpdate(
        { claveCliente: cliente.claveCliente },
        { $set: updateFields },
        { 
          returnDocument: 'after',
          upsert: false
        }
      );

      return result ? this.documentToEntity(result) : null;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error('Cliente ya existe con esa clave o email');
      }
      throw error;
    }
  }

  async getPageClientes(page: number): Promise<{ clientes: Cliente[]; totalDocuments: number }> {
    const limit = 100
    const skip = (page - 1) * limit;
    const totalDocuments = await this.collection.countDocuments({});
    const ultimatePage = Math.ceil(totalDocuments / limit);
    // Calcular la penúltima página
    const penultimatePage = ultimatePage - 1;
    const totalToPenultimatePage = penultimatePage * limit;

    const totalDocumentsUltimatePage = totalDocuments - totalToPenultimatePage;
    
    const [documents, total] = await Promise.all([
      this.collection.find({}).skip(skip).limit(limit).toArray(),
      (page === ultimatePage) ? totalDocumentsUltimatePage : limit
    ]);

    return {
      clientes: documents.map(doc => this.documentToEntity(doc)),
      totalDocuments: total
    };
  }

  async getTotalPages(): Promise<number> {
    try {
      const totalCount = await this.collection.countDocuments({});
      const limit = 100; // Número de documentos por página
      // Calcular total de páginas redondeado hacia arriba
      const totalPages = Math.ceil(totalCount / limit);
      return totalPages;
    } catch (error) {
      console.error('Error al obtener el total de páginas:', error);
      throw new Error('Error al obtener el total de páginas');
    }
  }
}