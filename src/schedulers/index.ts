import { schedule } from 'node-cron';

import { weatherCWAScheduler } from './weatherCWAScheduler';
const scheduleTasks = () => {
  // // 每分鐘更新一次
  schedule('* * * * *', async () => {
    await weatherCWAScheduler();
  });

  // 添加其他定时任务...
};

export default scheduleTasks;
