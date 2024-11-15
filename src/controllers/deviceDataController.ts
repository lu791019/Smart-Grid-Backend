import { Context } from 'hono';
import { getLatestDeviceData } from '../services/influxServices';
import logger from '@/utility/logger';

export const deviceDataController = {
  getLatestDeviceData: async (c: Context) => {
    try {
      const deviceIds = c.req.query('deviceIds')?.split(',');
      const start = c.req.query('start') || '-30d';
      const end = c.req.query('stop') || 'now()';

      if (!deviceIds || deviceIds.length === 0) {
        return c.json({ error: 'Device IDs are required' }, 400);
      }

      const queryInput = {
        start,
        end,
        deviceId: deviceIds,
      };

      const data = await getLatestDeviceData(queryInput);

      // 格式化返回的数据
      const formattedData = data.map((item) => ({
        _time: item._time,
        _value: item._value,
        _field: item._field,
        _measurement: item._measurement,
        deviceConfigId: item.deviceConfigId,
        deviceId: item.deviceId,
      }));

      return c.json(formattedData);
    } catch (error: any) {
      logger.error('Error in getLatestDeviceData controller:', error);
      return c.json(
        { error: 'Internal server error', details: error.message },
        500,
      );
    }
  },
};
