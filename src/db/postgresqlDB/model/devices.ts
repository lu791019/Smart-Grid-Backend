import { Model, DataTypes, Sequelize, Optional, Association } from 'sequelize';
import sequelize from '@/db/postgresqlDB/databases';
import DevicesConfig from './devicesConfig'; // 请根据实际路径修改

// 接口定义
interface ModbusInfo {
  host: string;
  port: number;
}

interface SnmpInfo {
  host: string;
  port: number;
}

interface DeviceAttributes {
  id: number;
  name: string;
  modbus_info?: ModbusInfo;
  snmp_info?: SnmpInfo;
  group?: string;
}

interface DeviceCreationAttributes extends Optional<DeviceAttributes, 'id'> {}

// 模型类定义
class Devices
  extends Model<DeviceAttributes, DeviceCreationAttributes>
  implements DeviceAttributes
{
  public id!: number;
  public name!: string;
  public modbus_info?: ModbusInfo;
  public snmp_info?: SnmpInfo;
  public group?: string;

  // 定义关联
  public devicesConfigs?: DevicesConfig[];
  public static associations: {
    devicesConfigs: Association<Devices, DevicesConfig>;
  };

  public static initialize(sequelize: Sequelize) {
    Devices.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        modbus_info: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        snmp_info: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        group: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'devices',
        timestamps: false, // 自动添加 createdAt 和 updatedAt 字段
      },
    );
  }

  public static associate() {
    Devices.hasMany(DevicesConfig, {
      foreignKey: 'device_id',
      sourceKey: 'id',
      as: 'devicesConfigs',
    });
  }
}

Devices.initialize(sequelize);
Devices.associate();
export default Devices;
