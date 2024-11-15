import { InfluxDB, FluxTableMetaData } from '@influxdata/influxdb-client';

// 使用 process.env 來獲取環境變量
const url: string = `http://${process.env.INFLUXDB_HOST!}:${process.env
  .INFLUXDB_PORT!}`;
const token: string = process.env.INFLUXDB_TOKEN!;
const org: string = process.env.INFLUXDB_ORG!;
const bucket: string = process.env.INFLUXDB_BUCKET!;

const client = new InfluxDB({ url, token });
const queryApi = client.getQueryApi(org);

interface QueryResult {
  time: string;
  value: number;
  field: string;
  deviceId: string;
  deviceConfigId: number;
}

export const executeQuery = async (query: string): Promise<QueryResult[]> => {
  const results: QueryResult[] = [];

  try {
    await new Promise<QueryResult[]>((resolve, reject) => {
      queryApi.queryRows(query, {
        next(row: string[], tableMeta: FluxTableMetaData) {
          const o = tableMeta.toObject(row);
          results.push({
            time: o._time,
            value: o._value,
            field: o._field,
            deviceId: o.deviceId,
            deviceConfigId: o.deviceConfigId,
          });
        },
        error(error: Error) {
          reject(new Error('查詢失敗'));
        },
        complete() {
          resolve(results);
        },
      });
    });
  } catch (error) {
    console.error('執行查詢時出錯:', error);
    throw error;
  }

  return results;
};
