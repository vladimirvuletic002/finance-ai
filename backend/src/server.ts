import app from './app.js';
import logger from './config/logger.js';
import config from './config/env.js';

app.listen(config.PORT, () => logger.info(`Server is listening on http://localhost:${config.PORT}`));
