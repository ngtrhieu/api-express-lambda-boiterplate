import { Router } from 'express';
import logger from '~/logger';

const router = Router();

router.get('/', (request, response) => {
  logger.info('Sending back response...');

  response.status(200).send({
    message: 'Hello world!',
  });
});

export default router;
