import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.routes';
import testRoute from './routes/test.routes';
import { socketHandler } from './sockets/socketHandler'; // if needed

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoute);
app.get("/",(req,res)=>{
  res.send("server is running");
})
// Create HTTP server and initialize socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",                     // local dev
      "https://exam-guard-three.vercel.app"        // correct production domain
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket']
});


// Socket.IO handling
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socketHandler(socket, io); // optional: only if you have a handler
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
