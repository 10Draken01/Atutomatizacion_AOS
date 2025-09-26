import express from 'express';
// inicializamos el env
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
// Middleware
app.use(express.json());

// Health check

export async function bootstrap() {
  try {
    
    app.get('/hello_world', (req, res) => {
      res.json({ message: 'Hello World!!! Rama new function' });
    });

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

  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}