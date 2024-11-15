import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config(); // 载入环境变量配置

// 获取并验证环境变量
const database = process.env.POSTGGRESQL_DATABASE;
const username = process.env.POSTGGRESQL_USERNAME;
const password = process.env.POSTGGRESQL_PASSWORD;
const host = process.env.POSTGGRESQL_HOST;
const port = process.env.POSTGGRESQL_PORT
  ? parseInt(process.env.POSTGGRESQL_PORT, 10)
  : 5432;

if (!database || !username || !host || !process.env.POSTGGRESQL_PORT) {
  throw new Error(
    'Missing necessary environment variables for database connection',
  );
}

// 创建一个 Sequelize 实例
const sequelize = new Sequelize({
  database,
  username,
  password,
  host,
  port,
  dialect: 'postgres', // 使用的数据库方言
  // 其他配置选项
  logging: false, // 关闭日志输出
});

export default sequelize;
