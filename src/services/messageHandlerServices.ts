// import moment from 'moment-timezone';
// import { saveData } from '@/services/influxServices';
// import type { Tag, Data } from '@/interface/interface';
// import logger from '@/utility/logger';

// interface DataItem {
//   name: string;
//   value: any;
//   deviceConfigId: number;
//   timestamp: Date;
// }

// const handleMessage = async (topic: string, message: Buffer) => {
//   let result: string = topic.split('/')[0];

//   switch (result) {
//     case 'device':
//       deviceHandler(topic, message);
//       break;
//   }
// };

// const deviceHandler = async (topic: string, message: Buffer) => {
//   const [_, deviceId, connectionMethod, frequency] = topic.split('/');
//   const messageContent = message.toString();

//   const topic_json: Tag = {
//     deviceId: deviceId,
//     method: connectionMethod,
//     frequency: frequency,
//   };
//   // messageContent轉乘json
//   let messageJson: Data = JSON.parse(messageContent);

//   // 將消息寫入數據庫
//   try {
//     // 這邊針對 messageJson裡面的data為[] 取出 name 和 value 當作key:value
//     // 並且將其放入messageJson裡面
//     if (Array.isArray(messageJson.data)) {
//       const data: DataItem[] = messageJson.data;

//       for (const item of data) {
//         const dataObj: Record<string, any> = {};
//         const currentTag: Tag = { ...topic_json };

//         // 提取 deviceConfigId
//         if (item.deviceConfigId !== undefined && item.deviceConfigId !== null) {
//           currentTag.deviceConfigId = String(item.deviceConfigId);
//         }
//         if (item.name === undefined || item.name === null) {
//           continue; // 跳過這個資料項目，繼續處理下一個
//         }

//         let name:string;
//         try {
//           name= item.name.replace(/\s+/g, '_')
//         }
//         catch (err)
//         {
//           name = item.name
//         }
//         // 构建数据对象
//         // 如果value 是數字，則轉換為數字
//         if (!isNaN(Number(item.value))) {
//           dataObj[name] = Number(item.value); // Ensure field names have no spaces.
//         } else {
//           dataObj[name] = item.value;
//         }

//         const timestamp = new Date(item.timestamp ?? Date.now());

//         // 写入 influxDB
//         await saveData('device', currentTag, dataObj, timestamp);
//       }
//     }
//   } catch (err) {
//     console.error('資料讀取寫入異常', err);
//     logger.error('資料讀取寫入異常:', err);
//   } finally {
//     console.log('');
//   }
// };

// export { handleMessage };

import moment from 'moment-timezone';
import { saveData } from '@/services/influxServices';
import type { Tag, Data } from '@/interface/interface';
import logger from '@/utility/logger';

interface DataItem {
  name: string;
  value: any;
  deviceConfigId: number;
  timestamp: Date;
}

interface WeatherData {
  Time: string;
  'Air pressure (inHg)': number;
  'Room temperature (degC)': number;
  'Outdoor temperature (degC)': number;
  'Outdoor huminity (%)': number;
  'UV index ': number;
  'Solar Radiation (W/m2)': number;
  'Daily rainfall (inches)': number;
  'Month rainfall (inches)': number;
  'Year rainfall (inches)': number;
  'System condition': number;
}

const handleMessage = async (topic: string, message: Buffer) => {
  let result: string = topic.split('/')[0];

  switch (result) {
    case 'device':
      await deviceHandler(topic, message);
      break;
    case 'weather':
      await weatherHandler(topic, message);
      break;
  }
};

const deviceHandler = async (topic: string, message: Buffer) => {
  const [_, deviceId, connectionMethod, frequency] = topic.split('/');
  const messageContent = message.toString();

  const topic_json: Tag = {
    deviceId: deviceId,
    method: connectionMethod,
    frequency: frequency,
  };

  let messageJson: Data = JSON.parse(messageContent);

  try {
    if (Array.isArray(messageJson.data)) {
      const data: DataItem[] = messageJson.data;

      for (const item of data) {
        const dataObj: Record<string, any> = {};
        const currentTag: Tag = { ...topic_json };

        if (item.deviceConfigId !== undefined && item.deviceConfigId !== null) {
          currentTag.deviceConfigId = String(item.deviceConfigId);
        }
        if (item.name === undefined || item.name === null) {
          continue;
        }

        let name: string;
        try {
          name = item.name.replace(/\s+/g, '_');
        } catch (err) {
          name = item.name;
        }

        if (!isNaN(Number(item.value))) {
          dataObj[name] = Number(item.value);
        } else {
          dataObj[name] = item.value;
        }

        const timestamp = new Date(item.timestamp ?? Date.now());
        await saveData('device', currentTag, dataObj, timestamp);
      }
    }
  } catch (err) {
    console.error('資料讀取寫入異常', err);
    logger.error('資料讀取寫入異常:', err);
  } finally {
    console.log('');
  }
};

const weatherHandler = async (topic: string, message: Buffer) => {
  const [_, stationId] = topic.split('/');
  const messageContent = message.toString();

  try {
    const weatherData: WeatherData = JSON.parse(messageContent);
    const timestamp = new Date(weatherData.Time);

    // 定義天氣站的標籤
    const topic_json: Tag = {
      stationId: stationId,
      type: 'weather_station',
    };

    // 建立資料物件，將所有氣象資料轉換成合適的格式
    const dataObj: Record<string, any> = {
      air_pressure: weatherData['Air pressure (inHg)'],
      room_temperature: weatherData['Room temperature (degC)'],
      outdoor_temperature: weatherData['Outdoor temperature (degC)'],
      outdoor_humidity: weatherData['Outdoor huminity (%)'],
      uv_index: weatherData['UV index '],
      solar_radiation: weatherData['Solar Radiation (W/m2)'],
      daily_rainfall: weatherData['Daily rainfall (inches)'],
      monthly_rainfall: weatherData['Month rainfall (inches)'],
      yearly_rainfall: weatherData['Year rainfall (inches)'],
      system_condition: weatherData['System condition'],
    };

    // 寫入 InfluxDB
    await saveData('weather', topic_json, dataObj, timestamp);

    logger.info(`Weather data saved successfully for station ${stationId}`);
  } catch (err) {
    console.error('天氣資料處理異常', err);
    logger.error('天氣資料處理異常:', err);
  }
};

export { handleMessage };
