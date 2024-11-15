import Devices from '@/db/postgresqlDB/model/devices';
import response from '@/utility/response';
import { Context } from 'hono';
import DevicesConfig from '@/db/postgresqlDB/model/devicesConfig';
import { re } from 'mathjs';

interface ModbusEntry {
  host: string;
  port: number;
  method: string;
  from_id: number;
  from_name: string;
  registers?: {
    name: string;
    address: string;
    length: number;
    scale: number;
    function: string;
    unit: string;
    frequency: number;
  }[];
}

interface SnmpEntry {
  host: string;
  port: number;
  method: string;
  from_id: number;
  from_name: string;
  registers?: {
    name: string;
    oid: string; // Assuming OID remains a string
    unit: string;
    scale: number;
    frequency: number;
    community: string;
  }[];
}

// 當edge 初始化時候 會來server上拿取需要更新的資訊
const devicesController = {
  getDevicesConfig: async (ctx: Context) => {
    try {
      const devices = await Devices.findAll({
        include: {
          model: DevicesConfig,
          as: 'devicesConfigs',
          where: { is_collect: true },
          required: false,
        },
      });
      const output: any = {};

      devices.forEach((device) => {
        const { id, name, modbus_info, snmp_info } = device;

        const configs = device.devicesConfigs as DevicesConfig[] | undefined;

        if (configs && configs.length > 0) {
          configs.forEach((config) => {
            const { type, frequency, ...rest } = config;
            const key = `${name}_${frequency}_${type}`;
            if (!output[key]) {
              output[key] = {
                key: key,
                host: '',
                port: '',
                method: type,
                from_id: id,
                from_name: name,
                frequency: frequency,
                registers: [],
              };
            }

            if (type === 'modbus' && modbus_info) {
              output[key].host = modbus_info.host;
              output[key].port = modbus_info.port;
              output[key].registers.push({
                id: config.id,
                name: config.name,
                address: parseInt(config.address, 10),
                length: config.length,
                scale: config.scale,
                function: config.function,
                unit: config.unit,
              });
            } else if (type === 'snmp' && snmp_info) {
              output[key].host = snmp_info.host;
              output[key].registers.push({
                id: config.id,
                name: config.name,
                oid: config.address,
                scale: config.scale,
                community: config.function,
                unit: config.unit,
              });
            } else if (type === 'API_BMS') {
              console.log('API_BMS');
              output[key].registers.push({
                id: config.id,
                name: config.name,
                url: config.address,
                scale: config.scale,
                community: config.function,
                unit: config.unit,
                option: config.option,
              });
            }
            // 对 registers 进行排序
            output[key].registers.sort((a: any, b: any) => {
              if (type === 'modbus') {
                return a.address - b.address;
              } else if (type === 'snmp') {
                return a.oid.localeCompare(b.oid);
              }
              return 0; // 默认返回值，以防方法出错
            });
          });
        }
      });

      return response.success(ctx, Object.values(output));
    } catch (error) {
      let errorMessage = 'An unexpected error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      return response.failed(ctx, errorMessage);
    }
  },
};

export default devicesController;
