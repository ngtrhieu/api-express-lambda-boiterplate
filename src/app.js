import { Router } from 'express';
import { name, description, version, author, license } from '~/../package.json';

const router = Router();

router.get('/version', (request, response) => {
  response.status(200).send({ name, description, version, author, license });
});

export default router;
