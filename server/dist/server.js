"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const index_js_1 = __importDefault(require("./index.js"));
const socketHandler_1 = require("./sockets/socketHandler");
const server = http_1.default.createServer(index_js_1.default);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*", // or specify your frontend URL
        methods: ["GET", "POST"],
    },
});
io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
    (0, socketHandler_1.socketHandler)(socket, io);
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
