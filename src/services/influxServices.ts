import InfluxModel from '@/db/influxDB/model/Model';
import type { Tag, Data } from '@/interface/interface';
import logger from '@/utility/logger';

interface QueryInput {
  start: string;
  end: string;
  deviceId: string[];
}

const saveData = async (
  measurement: string,
  tag: Tag,
  data: Data,
  timestamp: Date,
) => {
  try {
    const influxModel = new InfluxModel();
    await influxModel.save(measurement, tag, data, timestamp);
  } catch (err) {
    logger.error('寫入數據庫失敗:', err);
  } finally {
    console.log('done influxdb save');
  }
};

const formatTime = (timeString: string): string => {
  if (
    timeString === 'now()' ||
    timeString.startsWith('-') ||
    timeString.endsWith('d')
  ) {
    return timeString;
  }
  // 假設輸入是 ISO 8601 格式或者可以被 Date 解析
  return `${new Date(timeString).toISOString()}`;
};

const getLatestDeviceData = async (input: QueryInput) => {
  try {
    const influxModel = new InfluxModel();
    const formattedStart = formatTime(input.start);
    const formattedEnd = formatTime(input.end);

    const query = `
      from(bucket: "smart_grid")
        |> range(start: ${formattedStart}, stop: ${formattedEnd})
        |> filter(fn: (r) => (${input.deviceId
          .map((id) => `r["deviceConfigId"] == "${id}"`)
          .join(' or ')}))
    `;
    logger.info(`Executing InfluxDB query: ${query}`);
    const results = await influxModel.query(query);
    logger.info(`Query results: ${JSON.stringify(results)}`);
    return results;
  } catch (error) {
    logger.error('Error executing InfluxDB query:', error);
    console.error('Detailed InfluxDB error:', error);
    throw error;
  }
};

export { saveData, getLatestDeviceData };
