import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import log from 'node-file-logger';
import { logOptions } from './utils/Logger.js';
import { startMoralis, startCronJob } from './utils/Util.js';

// routes
import HashRoutes from './routes/HashRoutes.js';
import AdminRoutes from './routes/AdminRoutes.js';
import BlacklistRoutes from './routes/BlacklistRoutes.js';
import IconRoutes from './routes/IconRoutes.js';
// import MarketRoutes from './routes/MarketRoutes.js';
import SettingRoutes from './routes/SettingRoutes.js';

log.SetUserOptions(logOptions);
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('logs'))

await connectDB();
await startMoralis();
// await startCronJob();

app.get('/', (req, res) => {
  res.json({ message: 'Hello Pearswap!' });
});

// ROUTES HASH
app.use("/pool", HashRoutes);
app.use("/admin", AdminRoutes);
app.use("/icon", IconRoutes);
app.use("/setting", SettingRoutes);
app.use("/blacklist", BlacklistRoutes);

const { SERVER_PORT: port = 5000 } = process.env;

app.listen({ port }, () => {
  log.Info(`🚀 Server ready at ${port}`);
});