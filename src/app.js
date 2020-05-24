import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { loggerMiddleware } from './logger';
import api from './api/api';

const app = express();

app.use(loggerMiddleware);
app.use(cors({ exposedHeaders: ['Link'] }));
app.use(bodyParser.json());
app.use(api);

export default app;
