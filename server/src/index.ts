import express from "express"
import authRoutes from './routes/auth.routes'; 
import testRoute from './routes/test.routes'; 

const app=express();

app.use(express.json());

app.use('/api/auth/',authRoutes)
app.use('/api/test/',testRoute)

app.listen(3000,()=>{
    console.log("connected");
});

export default app