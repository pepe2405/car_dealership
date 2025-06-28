import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/database';
import testRoutes from './routes/test';
import authRoutes from './routes/user';
import carRoutes from './routes/car';
import adminRoutes from './routes/admin';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import http from 'http';
import { Server } from 'socket.io';
import Message from './models/Message';
import messagesRoutes from './routes/messages';
import testDriveRoutes from './routes/testDrive';
import forumRoutes from './routes/forum';
import leaseOptionsRoutes from './routes/leaseOptions';

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
}));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', messagesRoutes);
app.use('/api/test-drives', testDriveRoutes);
app.use('/api/forums', forumRoutes);
app.use('/api/lease-options', leaseOptionsRoutes);

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Car Dealership API',
      version: '1.0.0',
      description: 'API documentation for the Car Dealership System',
    },
    servers: [
      { url: 'http://localhost:5000/api' },
    ],
  },
  apis: ['./src/routes/*.ts'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to AutoMarket API' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server with socket.io
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
});

// Socket.io logic
io.on('connection', (socket) => {
  // Очаква userId при join
  socket.on('join', (userId) => {
    socket.join(userId);
  });

  // Изпращане на съобщение
  socket.on('send_message', async (data) => {
    // data: { sender, receiver, content }
    const message = await Message.create(data);
    io.to(data.receiver).emit('receive_message', message);
    io.to(data.sender).emit('receive_message', message); // за да се появи и при изпращача
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app; 