// src/routes/route.ts
import { Hono } from 'hono';
import devicesController from '@/controllers/devicesContoller';
import { apiController } from '@/controllers/apiController';
import { weatherDataService } from '@/services/weatherDataService';
import { deviceDataController } from '@/controllers/deviceDataController'; // 新增這行

const defaultRoute = new Hono();
const apiRouter = new Hono();

// 既有的路由
apiRouter.get('/devices_config', devicesController.getDevicesConfig);

// 新增的天氣數據路由
apiRouter.get('/fetch-all-weather', apiController.fetchAndStoreAllWeatherData);

// 新增獲取最新天氣數據的路由
// apiRouter.get('/latest-weather', async (c) => {
//   try {
//     const latestData = await weatherDataService.getLatestData();
//     return c.json(latestData);
//   } catch (error) {
//     console.error('Error fetching latest weather data:', error);
//     return c.json({ error: 'Failed to fetch latest weather data' }, 500);
//   }
// });

// Organizing root route
apiRouter.get('/device-data', deviceDataController.getLatestDeviceData);

defaultRoute.route('/apibackend', apiRouter);

export default defaultRoute;
