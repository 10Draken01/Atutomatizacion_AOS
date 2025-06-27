import { MongoClient, Db, Collection } from 'mongodb';
import { User } from '../../../Domain/Entities/User';
import { ClienteRepository } from '../../../Domain/Repositories/ClienteRepository';
import { Cliente } from '../../../Domain/Entities/Cliente';

interface ClienteDocument {
  _id: string;
  clave_cliente: string;
  nombre: string;
  celular: string;
  email: string;
  character_icon: string | number;
}

export class MongoClienteRepository implements ClienteRepository {
  private readonly collection: Collection<ClienteDocument>;

  constructor(database: Db) {
    this.collection = database.collection<ClienteDocument>('clientes');
  }

  async save(cliente: Cliente): Promise<void> {
    const document: ClienteDocument = {
      _id: cliente.id,
      clave_cliente: cliente.clave_cliente,
      nombre: cliente.nombre,
      celular: cliente.celular,
      email: cliente.email,
      character_icon: cliente.character_icon
    };

    await this.collection.insertOne(document);
  }

  async findByClaveCliente(clave_cliente: string): Promise<Cliente | null> {
    const document = await this.collection.findOne({ clave_cliente });
    
    if (!document) {
      return null;
    }

    return {
      id: document._id,
      clave_cliente: document.clave_cliente,
      nombre: document.nombre,
      celular: document.celular,
      email: document.email,
      character_icon: document.character_icon
    };
  }

  async deleteByClaveCliente(clave_cliente: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ clave_cliente });

    if (result.deletedCount === 0) {
      return false; // No document was deleted
    }

    return true; // Document was successfully deleted
  }

  async update(cliente: Cliente): Promise<Cliente | null> {
    const document: ClienteDocument = {
      _id: cliente.id,
      clave_cliente: cliente.clave_cliente,
      nombre: cliente.nombre,
      celular: cliente.celular,
      email: cliente.email,
      character_icon: cliente.character_icon
    };

    const result = await this.collection.findOneAndReplace(
      { _id: cliente.id },
      document,
      { returnDocument: 'after' }
    );

    if (!result) {
      return null; // No document was found to update
    }

    return {
      id: result._id,
      clave_cliente: result.clave_cliente,
      nombre: result.nombre,
      celular: result.celular,
      email: result.email,
      character_icon: result.character_icon
    };
  }
}
