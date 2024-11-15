import * as mqtt from 'mqtt';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';
import logger from '@/utility/logger';

import { handleMessage } from './messageHandlerServices';

dotenv.config();

const host = process.env.MQTT_HOST!;
const port = parseInt(process.env.MQTT_PORT!, 10);
const clientId = process.env.MQTT_CLIENT_ID!;
const username = process.env.MQTT_USERNAME!;
const password = process.env.MQTT_PASSWORD!;

// Resolve the directory name
// const __dirname = path.dirname(__filename);

console.log(__dirname);
console.log(path.join(__dirname, '../../ca/energypowerdemo/ca.cert.pem'));
const caFile = fs.readFileSync(
  path.join(__dirname, '../../ca/energypowerdemo/ca.cert.pem'),
);
const certFile = fs.readFileSync(
  path.join(__dirname, '../../ca/energypowerdemo/server.cert.pem'),
);
const keyFile = fs.readFileSync(
  path.join(__dirname, '../../ca/energypowerdemo/server.key.pem'),
);

const options: mqtt.IClientOptions = {
  host,
  port,
  protocol: 'mqtts',
  clientId,
  ca: [caFile],
  cert: certFile,
  key: keyFile,
  rejectUnauthorized: false,
  username,
  password,
};

const client = mqtt.connect(options);

let isConnected = false;

client.on('connect', () => {
  isConnected = true;
  console.log('客戶端已連接');
});

client.on('disconnect', () => {
  console.error('客戶端已斷開連接');
  isConnected = false;
});

client.on('error', (err) => {
  console.error('客戶端錯誤：' + err.message);
  logger.error('客戶端錯誤：' + err.message);
});

client.on('offline', () => {
  console.error('客戶端已離線');
  logger.error('客戶端已離線');
});

client.on('reconnect', () => {
  console.log('客戶端正在重新連接');
});

client.on('message', (topic, message) => {
  console.log(`收到主題 ${topic} 的消息：${message.toString()}`);
  handleMessage(topic, message);
});

const subscribe = (topic: string, callback: () => void) => {
  client.subscribe(topic, { qos: 1 }, (err) => {
    if (err) {
      console.error('訂閱失敗：' + err.message);
      logger.error('訂閱失敗：' + err.message);
    } else {
      console.log(`成功訂閱主題 ${topic}`);
      callback();
    }
  });
};

export { subscribe };
