import app from './app';
import logger from './logger';

const port = process.env.PORT || 3000;

logger.info(`Start server locally on port ${port}`);
app.listen(port, () => {
  logger.info(`Server started on port ${port}`);
});
