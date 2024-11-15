// src/services/weatherDataService.ts

import axios from 'axios';
import logger from '@/utility/logger';
import InfluxModel from '@/db/influxDB/model/Model';
import type { Tag, Data } from '@/interface/interface';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

if (!API_BASE_URL || !API_KEY) {
  throw new Error('API_BASE_URL or API_KEY is not defined in .env file');
}

export const weatherDataService = {
  async fetchAndSaveWeatherData(dataStoreId: string, stationId: string) {
    try {
      const data = await this.fetchData(dataStoreId, stationId);
      console.log(data);
      if (data) {
        await this.saveWeatherData(dataStoreId, data);
      }
    } catch (error) {
      logger.error(
        `Error in fetchAndSaveWeatherData for ${dataStoreId}:`,
        error,
      );
      throw error;
    }
  },

  async fetchData(dataStoreId: string, stationId: string) {
    try {
      const response = await axios.get(`${API_BASE_URL}/${dataStoreId}`, {
        params: {
          Authorization: API_KEY,
          format: 'JSON',
          StationId: stationId,
        },
      });

      if (
        response.data.success === 'true' &&
        response.data.records.Station &&
        response.data.records.Station.length > 0
      ) {
        return response.data.records.Station[0];
      } else {
        logger.warn(`No data available for ${dataStoreId}`);
        return null;
      }
    } catch (error) {
      logger.error(`Error fetching data from ${dataStoreId}:`, error);
      throw error;
    }
  },

  async saveWeatherData(dataStoreId: string, weatherData: any) {
    try {
      const measurement = `weather_${dataStoreId}`;
      const timestamp = new Date(weatherData.ObsTime.DateTime);

      const tag: Tag = {
        station_id: weatherData.StationId,
        station_name: weatherData.StationName,
      };

      let data: Data = {};

      switch (dataStoreId) {
        case 'O-A0001-001':
          data = this.parseOA0001001Data(weatherData);
          break;
        case 'O-A0002-001':
          data = this.parseOA0002001Data(weatherData);
          break;
        case 'O-A0003-001':
          data = this.parseOA0003001Data(weatherData);
          break;
        default:
          throw new Error(`Unknown dataStoreId: ${dataStoreId}`);
      }

      // Data validation
      this.validateWeatherData(dataStoreId, data);

      const influxModel = new InfluxModel();
      await influxModel.save(measurement, tag, data, timestamp);
      logger.info(
        `Weather data from ${dataStoreId} saved successfully for ${timestamp}`,
      );
    } catch (err) {
      logger.error(`Failed to save weather data from ${dataStoreId}:`, err);
      throw err;
    }
  },

  validateWeatherData(dataStoreId: string, data: Data) {
    const requiredFields: { [key: string]: string[] } = {
      'O-A0001-001': [
        'latitude',
        'longitude',
        'weather',
        'precipitation',
        'wind_direction',
        'wind_speed',
        'air_temperature',
        'relative_humidity',
        'air_pressure',
      ],
      'O-A0002-001': [
        'latitude',
        'longitude',
        'precipitation_now',
        'precipitation_10min',
        'precipitation_1hr',
        'precipitation_3hr',
        'precipitation_6hr',
        'precipitation_12hr',
        'precipitation_24hr',
      ],
      'O-A0003-001': [
        'latitude',
        'longitude',
        'weather',
        'visibility',
        'sunshine_duration',
        'precipitation',
        'wind_direction',
        'wind_speed',
        'air_temperature',
        'relative_humidity',
        'air_pressure',
        'uv_index',
        'peak_gust_speed',
      ],
    };

    const fields = requiredFields[dataStoreId];
    if (!fields) {
      throw new Error(`Unknown dataStoreId: ${dataStoreId}`);
    }

    for (const field of fields) {
      if (!(field in data)) {
        throw new Error(
          `Missing required field ${field} for dataStoreId ${dataStoreId}`,
        );
      }
    }
  },

  parseOA0001001Data(weatherData: any): Data {
    return {
      latitude: weatherData.GeoInfo.Coordinates[1].StationLatitude,
      longitude: weatherData.GeoInfo.Coordinates[1].StationLongitude,
      weather: weatherData.WeatherElement.Weather,
      precipitation: weatherData.WeatherElement.Now.Precipitation,
      wind_direction: weatherData.WeatherElement.WindDirection,
      wind_speed: weatherData.WeatherElement.WindSpeed,
      air_temperature: weatherData.WeatherElement.AirTemperature,
      relative_humidity: weatherData.WeatherElement.RelativeHumidity,
      air_pressure: weatherData.WeatherElement.AirPressure,
    };
  },

  parseOA0002001Data(weatherData: any): Data {
    return {
      latitude: weatherData.GeoInfo.Coordinates[1].StationLatitude,
      longitude: weatherData.GeoInfo.Coordinates[1].StationLongitude,
      precipitation_now: weatherData.RainfallElement.Now.Precipitation,
      precipitation_10min: weatherData.RainfallElement.Past10Min.Precipitation,
      precipitation_1hr: weatherData.RainfallElement.Past1hr.Precipitation,
      precipitation_3hr: weatherData.RainfallElement.Past3hr.Precipitation,
      precipitation_6hr: weatherData.RainfallElement.Past6Hr.Precipitation,
      precipitation_12hr: weatherData.RainfallElement.Past12hr.Precipitation,
      precipitation_24hr: weatherData.RainfallElement.Past24hr.Precipitation,
    };
  },

  parseOA0003001Data(weatherData: any): Data {
    return {
      latitude: weatherData.GeoInfo.Coordinates[1].StationLatitude,
      longitude: weatherData.GeoInfo.Coordinates[1].StationLongitude,
      weather: weatherData.WeatherElement.Weather,
      visibility: weatherData.WeatherElement.VisibilityDescription,
      sunshine_duration: weatherData.WeatherElement.SunshineDuration,
      precipitation: weatherData.WeatherElement.Precipitation,
      wind_direction: weatherData.WeatherElement.WindDirection,
      wind_speed: weatherData.WeatherElement.WindSpeed,
      air_temperature: weatherData.WeatherElement.AirTemperature,
      relative_humidity: weatherData.WeatherElement.RelativeHumidity,
      air_pressure: weatherData.WeatherElement.AirPressure,
      uv_index: weatherData.WeatherElement.UVIndex,
      peak_gust_speed: weatherData.WeatherElement.PeakGustSpeed,
    };
  },

  async fetchUVIndexData(stationId: string) {
    try {
      const response = await axios.get(`${API_BASE_URL}/O-A0005-001`, {
        params: {
          Authorization: API_KEY,
          format: 'JSON',
          StationID: stationId,
        },
      });

      if (
        response.data.success === 'true' &&
        response.data.records.weatherElement
      ) {
        const data = response.data.records.weatherElement;
        await this.saveUVIndexData(stationId, data);
      } else {
        logger.warn('No UV Index data available');
      }
    } catch (error) {
      logger.error('Error fetching UV Index data:', error);
      throw error;
    }
  },

  async saveUVIndexData(stationId: string, data: any) {
    try {
      const measurement = 'weather_O-A0005-001';
      const timestamp = new Date(data.Date);

      const tag: Tag = {
        station_id: stationId,
      };

      const uvData: Data = {
        uv_index: data.location[0]?.weatherElement.UVIndex,
      };

      const influxModel = new InfluxModel();
      await influxModel.save(measurement, tag, uvData, timestamp);
      logger.info(`UV Index data saved successfully for ${timestamp}`);
    } catch (err) {
      logger.error('Failed to save UV Index data:', err);
      throw err;
    }
  },
};

//   async getLatestData() {
//     try {
//       const influxModel = new InfluxModel();
//       const result = await influxModel.query(`
//         from(bucket:"your_bucket_name")
//           |> range(start: -24h)
//           |> filter(fn: (r) => r._measurement =~ /^weather_/)
//           |> group(columns: ["_measurement", "station_id"])
//           |> last()
//       `);
//       return result;
//     } catch (error) {
//       logger.error('Error retrieving latest weather data:', error);
//       throw error;
//     }
//   }
// };
