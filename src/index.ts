import { createHermesService } from '@rayanacapital/hermes';
import './periodicTasks';
import { ws } from './ws';

const pkg = require('../package.json');

const port = process.env.PORT ? +process.env.PORT : 8087;

const service = createHermesService({
  wsRoutes: {
    '/ws': ws,
  },
});

async function start() {
  await service.start(port);

  console.log(`screener-backend server v${pkg.version} is running`);
  console.log(`HTTP port: ${port}`);
  console.log(`WS port: ${port + 1}`);
}

start();

process
  .on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at Promise', reason, p);
  })
  .on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown', err);
    process.exit(1);
  });
