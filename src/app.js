import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { loggerMiddleware } from './logger';

const app = express();

app.use(loggerMiddleware);
app.use(cors({ exposedHeaders: ['Link'] }));
app.use(bodyParser.json());

export default app;
