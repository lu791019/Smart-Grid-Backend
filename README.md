```
npm install
npm run format
npm run dev
```

```
GET http://localhost:3000/apibackend/device-data

GET http://localhost:3000/apibackenddevices_config

GET http://localhost:3000/fetch-all-weather



```




# Server 專案說明

## 項目簡介

本專案旨在管理和處理多源數據訂閱，特別是氣象數據和設備數據，並將其存儲至 InfluxDB 或 PostgreSQL。專案架構包括數據訂閱、數據處理、數據存儲及 API 接口等功能模塊。

## 架構圖

以下是系統的架構圖，幫助您更好地理解項目結構：

```mermaid
---
title: Server 專案架構
---

classDiagram
    class InitController {
        +初始化()
        +訂閱MQTT()
    }
    InitController --> 氣象數據服務: 訂閱氣象數據

    class 氣象數據服務 {
        +處理氣象訂閱()
    }
    氣象數據服務 --> InfluxDB服務: 將數據存入InfluxDB

    Edge項目 --> 消息處理服務: 處理MQTT消息

    class 消息處理服務 {
        +處理消息()
    }
    消息處理服務 --> 氣象數據處理: 處理氣象數據

    class 氣象數據處理 {
        +處理氣象數據()
    }

    氣象數據處理 --> InfluxDB服務: 將數據存入InfluxDB

    消息處理服務 --> 設備數據處理: 處理解決部數據

    class 設備數據處理 {
        +處理設備數據()
    }

    設備數據處理 --> InfluxDB服務: 將數據存入InfluxDB

    class InfluxDB服務 {
        +寫入數據()
    }

    InitController --> Edge項目: 訂閱Edge項目數據

    class Edge項目 {
        +數據處理()
    }

    InitController --> 設備控制器API: 整理訂閱設定

    設備控制器API --> postrgesql: 拉取設備配置
    
    class 設備控制器API {
        +整理訂閱配置()
    }

    InitController --> 設備數據控制器API: 整理設備數據

    class 設備數據控制器API {
        +提供訂閱配置數據
    }
    設備數據控制器API --> InfluxDB服務: 拉取數據




```angular2html

npx sequelize-cli db:migrate

```

```angular2html

npx sequelize-cli db:migrate:undo
```


# 專案詳細說明
-- 
### Controllers
1. controllers/initController.ts: 負責初始化系統以及訂閱 MQTT 主題。包括氣象數據和 Edge 項目的數據訂閱及處理。 
## Services
1. services/weatherDataService.ts: 處理氣象相關的數據訂閱。從氣象站（小白屋）獲取氣象數據，並利用 MQTT 進行發布。
2. services/messageHandlerServices.ts: 處理通過 MQTT 接收到的消息，包含 weather 和 device 兩類消息。
3. services/influxServices.ts: 將整理好的數據存入 InfluxDB，便於後續查詢和分析。
### API
1. api/devicesController.ts: 為 Edge 專案提供數據訂閱的相關設置和整理好的信息。
2. api/deviceDataController.ts: 為需要使用的人提供從 InfluxDB 中拉取存儲數據的接口。
### Data Storage
1. InfluxDB: 用於存儲從各種來源獲取到的數據，包括氣象數據和設備數據。
2. PostgreSQL: 用於存儲和管理設備的訂閱設置信息。
