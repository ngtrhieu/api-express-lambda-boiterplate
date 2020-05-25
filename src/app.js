import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { name, description, version, author, license } from '~/../package.json';

import { loggerMiddleware } from './logger';

const app = express();

app.use(loggerMiddleware);
app.use(cors({ exposedHeaders: ['Link'] }));
app.use(bodyParser.json());
app.get('/version', (request, response) => {
  response.status(200).send({ name, description, version, author, license });
});

export default app;
