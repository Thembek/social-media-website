import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import multer from 'multer';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';

import authRoutes, { register} from './routes/auth.js';
import userRoutes from './routes/users.js';
import postRoutes, { createPost } from './routes/post.js';
import { users, posts } from './data/index.js';
import { verify } from 'crypto';

/* firewall */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use('/assets', express.static(path.join(__dirname, "public/assets")));

/* storage */
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, file.originalname);
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });

/* File routes */
app.post('/auth/register', upload.single('picture'), register);
app.post('/post', verify, upload.single('picture'), createPost);

/* routes */
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/posts', postRoutes);

/* Mongoose setup */
const PORT = process.env.PORT || 5000;
const db = process.env.MONGO_URL;
mongoose.connect(db,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }    
)
.then(() => { app.listen(PORT, () => console.log(`Server port: http://localhost:${PORT}`))})
.catch((error) => console.log(`${error} did not correct`));