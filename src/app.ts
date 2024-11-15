import { Hono } from 'hono';
import scheduleTasks from '@/schedulers/index';
import initController from '@/controllers/initController';
import { weatherDataService } from '@/services/weatherDataService';
import cron from 'node-cron';
const app = new Hono();

import defaultRoute from '@/routes/route';
// 启动定时任务
scheduleTasks();

// 啟動服務 init 的服務 如訂閱服務
initController();



// 添加天氣數據獲取的定時任務
cron.schedule(
  '0 * * * *',
  async () => {
    try {
      const stationId = 'C0C700';
      await weatherDataService.fetchAndSaveWeatherData(
        'O-A0001-001',
        stationId,
      );
      await weatherDataService.fetchAndSaveWeatherData(
        'O-A0002-001',
        stationId,
      );
      await weatherDataService.fetchAndSaveWeatherData(
        'O-A0003-001',
        stationId,
      );
      await weatherDataService.fetchUVIndexData(stationId);
      console.log('Weather data updated successfully');
    } catch (error) {
      console.error('Error updating weather data:', error);
    }
  },
  {
    scheduled: true,
    timezone: 'Asia/Taipei',
  },
);

// 使用路由
app.route('/', defaultRoute);

export default app;
