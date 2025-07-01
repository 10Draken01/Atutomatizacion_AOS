import { MongoClient, Db, Collection } from 'mongodb';
import { User } from '../../../Domain/Entities/User';
import { ClienteRepository } from '../../../Domain/Repositories/ClienteRepository';
import { Cliente } from '../../../Domain/Entities/Cliente';
import { Character_Icon_type } from '../../../Domain/Entities/Character_Icon_type';

interface ClienteDocument {
  _id: string;
  clave_cliente: string;
  nombre: string;
  celular: string;
  email: string;
  character_icon: number | Character_Icon_type;
  created_at: Date;
  updated_at: Date;
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
      clave_cliente: document.clave_cliente,
      nombre: document.nombre,
      celular: document.celular,
      email: document.email,
      character_icon: document.character_icon,
      created_at: document.created_at,
      updated_at: document.updated_at 
    };
  }

  // Método helper para convertir entidad a documento
  private entityToDocument(cliente: Cliente): ClienteDocument {
    const baseDocument = {
      _id: cliente.id,
      clave_cliente: cliente.clave_cliente,
      nombre: cliente.nombre,
      celular: cliente.celular,
      email: cliente.email,
      character_icon: cliente.character_icon,
      created_at: cliente.created_at,
      updated_at: cliente.updated_at
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
      if (cliente.clave_cliente != null && cliente.clave_cliente.trim() !== '') {
        updateFields.clave_cliente = cliente.clave_cliente.trim();
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

      if (cliente.character_icon != null) {
        updateFields.character_icon = cliente.character_icon;
      }

      updateFields.updated_at = cliente.updated_at;

      // Si no hay campos para actualizar (solo timestamp), no hacer nada
      if (Object.keys(updateFields).length === 1) {
        // Solo devolver el cliente existente sin cambios
        const existing = await this.collection.findOne({ clave_cliente: cliente.clave_cliente });
        return existing ? this.documentToEntity(existing) : null;
      }

      const result = await this.collection.findOneAndUpdate(
        { clave_cliente: cliente.clave_cliente },
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