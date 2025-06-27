import { MongoClient, Db, Collection } from 'mongodb';
import { UserRepository } from '../../../Domain/Repositories/UserRepository';
import { User } from '../../../Domain/Entities/User';
import { UserFounded } from '../../../Application/DTOs/UserFounded';

interface UserDocument {
  _id: string;
  username: string;
  email: string;
  password: string;
}

export class MongoUserRepository implements UserRepository {
  private readonly collection: Collection<UserDocument>;

  constructor(database: Db) {
    this.collection = database.collection<UserDocument>('users');
  }

  async save(user: User): Promise<void> {
    const document: UserDocument = {
      _id: user.id,
      username: user.username,
      email: user.email,
      password: user.password
    };

    await this.collection.insertOne(document);
  }

  async findByEmail(email: string): Promise<User | null> {
    const document = await this.collection.findOne({ email });
    
    if (!document) {
      return null;
    }

    return {
      id: document._id,
      username: document.username,
      email: document.email,
      password: document.password
    };
  }
}
