import { weatherDataService } from '@/services/weatherDataService';
import logger from '@/utility/logger';

const weatherCWAScheduler = async () => {
  try {
    const stationId = 'C0C700';

    await weatherDataService.fetchAndSaveWeatherData('O-A0001-001', stationId);

    await weatherDataService.fetchAndSaveWeatherData('O-A0002-001', stationId);

    await weatherDataService.fetchAndSaveWeatherData('O-A0003-001', stationId);

    await weatherDataService.fetchUVIndexData(stationId);
  } catch (error) {
    logger.error('Error fetching and storing weather data:', error);
  }
};

export { weatherCWAScheduler };
