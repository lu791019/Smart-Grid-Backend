import { subscribe } from '@/services/mqttServices';

// /devices/{device_id}/{connection_method}/{frequency}
// /devices/15kw/modbus/1s
// /devices/30kw/snmp/60s

const initController = () => {
  // 讀取DB知道有哪些訂閱要處理

  subscribe('device/#', () => {
    console.log('成功訂閱 devices/# 主題');
  });
  subscribe('weather/#', () => {
    console.log('成功訂閱 weather/# 主題');
  });
};

export default initController;
