import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;
const __dirname=path.resolve();

if(process.env.NODE_ENV !== "production"){
  app.use(cors());
}

const limit=rateLimit({
  windowMs: 1*60*1000,
  max:15,
  message: "Too many requests. Please wait...",
  standardHeaders: true,
  legacyHeaders: false
});

app.use(express.json());

app.use(limit);
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);

if(process.env.NODE_ENV === 'production'){
  app.use(express.static(path.join(__dirname, '../frontend','dist')));
  app.get('*',(req, res)=>{
    res.sendFile(path.join(__dirname, '../frontend', "dist", 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

connectDB().then(()=>{
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});