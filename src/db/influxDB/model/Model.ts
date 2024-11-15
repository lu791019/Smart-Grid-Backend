import {
  InfluxDB,
  Point,
  WriteApi,
  QueryApi,
} from '@influxdata/influxdb-client';
import logger from '@/utility/logger';
import type { Tag, Data } from '@/interface/interface';

let instance: Model | null = null;

export default class Model {
  public influxDB: InfluxDB | null = null;
  public writeApi: WriteApi | null = null;
  private queryApi: QueryApi | null = null;

  constructor() {
    if (instance) {
      return instance;
    }

    const URL = `http://${process.env.INFLUXDB_HOST}:${process.env.INFLUXDB_PORT}`;
    const TOKEN = process.env.INFLUXDB_TOKEN!;
    const ORG = process.env.INFLUXDB_ORG!;
    const BUCKET = process.env.INFLUXDB_BUCKET!;

    this.influxDB = new InfluxDB({
      url: URL,
      token: TOKEN,
    });

    const writeOptions = {
      batchSize: 100,
      flushInterval: 5000,
    };

    this.writeApi = this.influxDB.getWriteApi(ORG, BUCKET, 'ns', writeOptions);
    this.queryApi = this.influxDB.getQueryApi(ORG);

    instance = this;
  }

  private setField(
    point: Point,
    key: string,
    value: number | string | boolean,
  ): any {
    // 判斷value的型態
    let fieldType =
      typeof value === 'number'
        ? 'float'
        : typeof value === 'boolean'
        ? 'boolean'
        : 'string';

    switch (fieldType) {
      case 'float':
        point.floatField(key, value as number);
        break;
      case 'boolean':
        point.booleanField(key, value as boolean);
        break;
      case 'string':
        point.stringField(key, value as string);
        break;
      default:
        console.error(`Unknown field type: ${fieldType} for field ${key}`);
        break;
    }
  }

  async save(
    measurement: string,
    tag: Tag,
    data: Data,
    timestamp: Date,
  ): Promise<boolean> {
    if (!measurement) {
      console.error('Measurement is not defined');
      return false;
    }

    const point = new Point(measurement).timestamp(timestamp);

    Object.entries(tag).forEach(([key, value]) => {
      point.tag(key, value);
    });

    Object.entries(data).forEach(([key, value]) => {
      this.setField(point, key, value);
    });

    return await this.writePoints(point);
  }

  private async writePoints(point: Point): Promise<boolean> {
    if (!this.writeApi) {
      console.error('Write API is not initialized');
      return false;
    }

    try {
      await this.writeApi.writePoint(point);
    } catch (e) {
      logger.error(e);
      return false;
    }
    return true;
  }

  async query(fluxQuery: string): Promise<any[]> {
    if (!this.queryApi) {
      throw new Error('Query API is not initialized');
    }

    try {
      logger.info(`Executing InfluxDB query: ${fluxQuery}`);
      const result = await this.queryApi.collectRows(fluxQuery);
      logger.info(`Query results: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      logger.error('Error executing InfluxDB query:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (!this.writeApi) {
      console.error('Write API is not initialized');
      return;
    }

    try {
      await this.writeApi.close();
      console.log('Flushed data and closed write API');
    } catch (e) {
      console.error('Error closing write API:', e);
    }
  }
}
