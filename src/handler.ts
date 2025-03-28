import { Context, Handler } from 'aws-lambda';
import { createServer, proxy } from 'aws-serverless-express';
import { Server } from 'http';
import { bootstrap, runServer } from './bootstrap';

let cachedServer: Server;
export const handler: Handler = async (event: any, context: Context) => {
  if (!cachedServer) {
    const { app, expressInstance } = await bootstrap();
    await app.init();
    cachedServer = createServer(expressInstance);
  }

  if (event.path === '/docs') {
    event.path = '/docs/';
  }
  if (event.path) {
    event.path = event.path.includes('swagger-ui')
      ? `/docs${event.path}`
      : event.path;
  }
  return proxy(cachedServer, event, context, 'PROMISE').promise;
};

if (process.env.NODE_ENV === 'local') {
  runServer()
    .then(() => console.log('Nest Ready'))
    .catch((error) => console.log(error));
}
