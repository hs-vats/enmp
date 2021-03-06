import express from 'express';
import cors from 'cors';

import { requestLogger, logger } from './utils/logger';
import {
    validationErrorHandler,
    internalErrorHandler
} from './utils/error_handler';
import { timeTracker } from './utils/time_tracker';
import { usersRouter, groupsRouter, loginRouter } from './controllers';
import { tokenValidator } from './utils/token_validator';

const port = process.env.PORT || 3000;

const app = express();

app.use(timeTracker);
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(tokenValidator);

app.use('/login', loginRouter);
app.use('/users', usersRouter);
app.use('/groups', groupsRouter);

app.use(validationErrorHandler);
app.use(internalErrorHandler);

app.listen(port, () => {
    logger.info('server is running on port %d', port);
});

process
    .on('unhandledRejection', (reason, p) => {
        logger.error(reason, 'Unhandled Rejection at Promise', p);
    })
    .on('uncaughtException', (err) => {
        logger.error(err, 'Uncaught Exception thrown');
        process.exit(1);
    });
