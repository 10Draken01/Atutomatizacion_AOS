import { MongoClient, Db } from 'mongodb';

export class DatabaseConnection {
  private client: MongoClient | null = null;
  private database: Db | null = null;

  async connect(connectionString: string, databaseName: string): Promise<Db> {
    try {
      this.client = new MongoClient(connectionString);
      await this.client.connect();
      this.database = this.client.db(databaseName);
      console.log('Connected to MongoDB');
      return this.database;
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      console.log('Disconnected from MongoDB');
    }
  }

  getDatabase(): Db {
    if (!this.database) {
      throw new Error('Database not connected');
    }
    return this.database;
  }
}