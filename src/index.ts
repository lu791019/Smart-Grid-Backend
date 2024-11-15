import { serve } from '@hono/node-server';
import app from '@/app';
import sequelize from '@/db/postgresqlDB/databases';

const port = 3000;
console.log(`Server is running on port ${port}`);

sequelize
  .sync()
  .then(() => {
    console.log('Database synchronized');

    // 使用 Hono 的 serve 方法来启动服务器
    serve({
      fetch: app.fetch,
      port,
    });

    console.log(`Server is running on port ${port}`);
  })
  .catch((error) => {
    console.error('Failed to synchronize database:', error);
  });
