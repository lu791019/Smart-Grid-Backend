import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import sequelize from '@/db/postgresqlDB/databases';

// 接口定义
interface DeviceConfigAttributes {
  id: number;
  name: string;
  address: string;
  length: number;
  scale?: number | null; // 设为可选属性
  function: string;
  unit?: string | null; // 设为可选属性
  is_collect: boolean;
  remark?: string;
  device_id: number;
  type: string;
  frequency: number;
  option?: object;
}

interface DeviceConfigCreationAttributes
  extends Optional<DeviceConfigAttributes, 'id'> {}

// 模型类定义
class DevicesConfig
  extends Model<DeviceConfigAttributes, DeviceConfigCreationAttributes>
  implements DeviceConfigAttributes
{
  public id!: number;
  public name!: string;
  public address!: string;
  public length!: number;
  public scale?: number | null; // 设为可选属性
  public function!: string;
  public unit?: string | null; // 设为可选属性
  public is_collect!: boolean;
  public remark?: string;
  public device_id!: number;
  public type!: string;
  public frequency!: number;
  public option?: object;

  public static initialize(sequelize: Sequelize) {
    DevicesConfig.init(
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
        address: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        length: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        scale: {
          type: DataTypes.FLOAT,
          allowNull: true,
        },
        function: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        unit: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        is_collect: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
        },
        remark: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        device_id: {
          type: DataTypes.INTEGER, // 修改为整数以匹配外键
          allowNull: false,
        },
        type: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        frequency: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        option: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'devices_config',
        timestamps: false,
      },
    );
  }
}

DevicesConfig.initialize(sequelize);

export default DevicesConfig;
