console.clear();
import { createApp } from './app';

const port = process.env.PORT || 5000;

async function startServer() {
  const app = await createApp();
  
  app.listen(port, () => {
    console.log(`\x1b[32m[TCPListen@2.1]\x1b[0m localhost:${port}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
