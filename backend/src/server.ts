import express, { Router } from 'express';
import cors from 'cors'
import mongoose from 'mongoose';
import userRouter from './routes/user.routes';

import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

// Sluzi static fajlove iz uploads foldera na backendu
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

mongoose.connect("mongodb://127.0.0.1:27017/projekat2026v2")
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("db connection ok")
})

import adminRouter from './routes/admin.routes';

const router = Router()
router.use('/user', userRouter)
router.use('/admin', adminRouter)

app.use('/', router)

app.listen(4000, () => console.log(`Express server running on port 4000`));