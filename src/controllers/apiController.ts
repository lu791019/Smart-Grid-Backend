// src/controllers/apiController.ts
import { Context } from 'hono';
import { weatherDataService } from '../services/weatherDataService';
import logger from '@/utility/logger';

export const apiController = {
  async fetchAndStoreAllWeatherData(c: Context) {
    try {
      const stationId = 'C0C700';
      const results = [];

      results.push(
        await weatherDataService.fetchAndSaveWeatherData(
          'O-A0001-001',
          stationId,
        ),
      );
      results.push(
        await weatherDataService.fetchAndSaveWeatherData(
          'O-A0002-001',
          stationId,
        ),
      );
      results.push(
        await weatherDataService.fetchAndSaveWeatherData(
          'O-A0003-001',
          stationId,
        ),
      );
      results.push(await weatherDataService.fetchUVIndexData(stationId));

      return c.json(
        {
          message: 'All weather data fetched and stored successfully',
          results,
        },
        200,
      );
    } catch (error) {
      logger.error('Error fetching and storing weather data:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  },
};
// 新增一個方法來檢索最近的數據
//   async getLatestWeatherData(c: Context) {
//     try {
//       const latestData = await weatherDataService.getLatestData();
//       return c.json(latestData, 200);
//     } catch (error) {
//       logger.error('Error retrieving latest weather data:', error);
//       return c.json({ error: 'Internal server error' }, 500);
//     }
//   }
// };
