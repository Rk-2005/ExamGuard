import express from "express"
import { createServer } from "http";
import { Server } from "socket.io";

const app=express();

const port=3000;

const server=createServer(app);

const io=new Server(server,{
     cors: {
     origin: ["http://localhost:5173", "https://examguard.vercel.app"],
  },
});

io.on("connection",(scoket)=>{
    console.log("user connected");  
    
})

server.listen(3000, () => {
  console.log('server running at https://examguard-server.onrender.com');
});

