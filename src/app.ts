import express from 'express';
import { Container } from './DI/Container';

// inicializamos el env
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const MONGO_URI = `mongodb://${process.env.MONGO_ROOT_USER}:${process.env.MONGO_ROOT_PASSWORD}@mongodb:27017`;
const DB_NAME = process.env.DB_NAME || 'exampledb';
const JWT_SECRET = process.env.JWT_SECRET || 'example_example_example_example_example_example_example_example'; 
const FOLDER_ID = process.env.FOLDER_ID || 'id_folder_example';
// Middleware
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

export async function bootstrap() {
  try {
    // Initialize container
    const container = Container.getInstance(); 
    await container.initialize(
      MONGO_URI, 
      DB_NAME, 
      JWT_SECRET,
      FOLDER_ID 
    );

    // Setup routes WITHOUT global validation middleware
    const userRoutes = container.getUserRoutes();
    app.use('/api/users', userRoutes.getRouter());

    const clienteRoutes = container.getClienteRoutes();
    app.use('/api/clientes', clienteRoutes.getRouter());

    // Global error handler
    app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Unhandled error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
      });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'The requested resource was not found'
      });
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`Create user: POST http://localhost:${PORT}/api/users`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('Received SIGTERM, shutting down gracefully');
      await container.shutdown();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('Received SIGINT, shutting down gracefully');
      await container.shutdown();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}