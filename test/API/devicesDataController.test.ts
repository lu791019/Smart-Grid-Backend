import { deviceDataController } from '@/controllers/deviceDataController';
import { getLatestDeviceData } from '@/services/influxServices';
import logger from '@/utility/logger';
import { Context } from 'hono';
import { describe, expect, it, afterEach,beforeAll, beforeEach, afterAll, jest } from '@jest/globals';



jest.mock('@/services/influxServices');
jest.mock('@/utility/logger');

describe('deviceDataController', () => {
    let ctx: Context;
    let jsonMock: jest.Mock;
    let queryMock: jest.Mock;

    beforeEach(() => {
        jsonMock = jest.fn();
        queryMock = jest.fn();
        ctx = {
            req: {
                query: queryMock,
            },
            json: jsonMock,
        } as unknown as Context;

        jest.clearAllMocks();
    });

    it('should return formatted device data', async () => {
        queryMock.mockImplementation((param: string) => {
            switch (param) {
                case 'deviceIds':
                    return '1,2,3';
                case 'start':
                    return '-30d';
                case 'stop':
                    return 'now()';
                default:
                    return undefined;
            }
        });

        const mockData = [
            {
                _time: '2023-10-10T00:00:00Z',
                _value: 42,
                _field: 'temperature',
                _measurement: 'device',
                deviceConfigId: 'config1',
                deviceId: '1',
            },
            {
                _time: '2023-10-11T00:00:00Z',
                _value: 43,
                _field: 'humidity',
                _measurement: 'device',
                deviceConfigId: 'config2',
                deviceId: '2',
            },
        ];

        (getLatestDeviceData as jest.Mock).mockResolvedValue(mockData);

        await deviceDataController.getLatestDeviceData(ctx);

        expect(getLatestDeviceData).toHaveBeenCalledWith({
            start: '-30d',
            end: 'now()',
            deviceId: ['1', '2', '3'],
        });

        expect(jsonMock).toHaveBeenCalledWith([
            {
                _time: '2023-10-10T00:00:00Z',
                _value: 42,
                _field: 'temperature',
                _measurement: 'device',
                deviceConfigId: 'config1',
                deviceId: '1',
            },
            {
                _time: '2023-10-11T00:00:00Z',
                _value: 43,
                _field: 'humidity',
                _measurement: 'device',
                deviceConfigId: 'config2',
                deviceId: '2',
            },
        ]);
    });

    it('should return 400 if no device IDs are provided', async () => {
        queryMock.mockReturnValue(undefined);

        await deviceDataController.getLatestDeviceData(ctx);

        expect(jsonMock).toHaveBeenCalledWith({ error: 'Device IDs are required' }, 400);
    });

    it('should handle errors correctly', async () => {
        const errorMessage = 'Something went wrong';
        (getLatestDeviceData as jest.Mock).mockRejectedValue(new Error(errorMessage));

        queryMock.mockReturnValue('1,2,3');

        await deviceDataController.getLatestDeviceData(ctx);

        expect(logger.error).toHaveBeenCalledWith('Error in getLatestDeviceData controller:', expect.any(Error));
        expect(jsonMock).toHaveBeenCalledWith({ error: 'Internal server error', details: errorMessage }, 500);
    });
});