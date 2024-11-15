import { handleMessage } from '@/services/messageHandlerServices'; // Adjust the path to the correct location
import { saveData } from '@/services/influxServices';
import logger from '@/utility/logger';
import type { Context } from 'hono';
import { describe, expect, it, afterEach,beforeAll, beforeEach, afterAll, jest } from '@jest/globals';


jest.mock('@/services/influxServices'); // Mock saveData function
jest.mock('@/utility/logger'); // Mock logger

describe('handleMessage', () => {
    const mockSaveData = saveData as jest.Mock;
    const mockLogger = logger as jest.Mocked<typeof logger>;

    afterEach(() => {
        jest.clearAllMocks(); // Clear mock history after each test
    });

    it('should handle device message and save data correctly', async () => {
        const topic = 'device/1/modbus/1000';
        const message = Buffer.from(JSON.stringify({
            data: [
                {
                    name: 'Temperature',
                    value: '25.3',
                    deviceConfigId: 123,
                    timestamp: '2023-10-10T00:00:00Z'
                },
                {
                    name: 'Humidity',
                    value: '60',
                    deviceConfigId: 124,
                    timestamp: '2023-10-10T00:00:00Z'
                }
            ]
        }));

        await handleMessage(topic, message);

        expect(mockSaveData).toHaveBeenCalledTimes(2);

        expect(mockSaveData).toHaveBeenNthCalledWith(
            1,
            'device',
            { deviceId: '1', method: 'modbus', frequency: '1000', deviceConfigId: '123' },
            { Temperature: 25.3 },
            new Date('2023-10-10T00:00:00Z')
        );

        expect(mockSaveData).toHaveBeenNthCalledWith(
            2,
            'device',
            { deviceId: '1', method: 'modbus', frequency: '1000', deviceConfigId: '124' },
            { Humidity: 60 },
            new Date('2023-10-10T00:00:00Z')
        );

        expect(mockLogger.info).not.toHaveBeenCalled();
        expect(mockLogger.error).not.toHaveBeenCalled();
    });



    it('should handle message with no data', async () => {
        const topic = 'device/1/modbus/1000';
        const message = Buffer.from(JSON.stringify({ data: [] }));

        await handleMessage(topic, message);

        expect(mockSaveData).not.toHaveBeenCalled();
        expect(mockLogger.info).not.toHaveBeenCalled();
        expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should skip items with invalid or undefined names', async () => {
        const topic = 'device/1/modbus/1000';
        const message = Buffer.from(JSON.stringify({
            data: [
                {
                    name: null,
                    value: '25.3',
                    deviceConfigId: 123,
                    timestamp: '2023-10-10T00:00:00Z'
                },
                {
                    name: '  ',
                    value: '60',
                    deviceConfigId: 124,
                    timestamp: '2023-10-10T00:00:00Z'
                }
            ]
        }));

        await handleMessage(topic, message);

        expect(mockSaveData).toHaveBeenCalledTimes(1); // Skip the invalid name
        expect(mockSaveData).toHaveBeenCalledWith(
            'device',
            { deviceId: '1', method: 'modbus', frequency: '1000', deviceConfigId: '124' },
            { _: 60 }, // Ensure spaces are handled correctly
            new Date('2023-10-10T00:00:00Z')
        );
        expect(mockLogger.info).not.toHaveBeenCalled();
        expect(mockLogger.error).not.toHaveBeenCalled();
    });
});