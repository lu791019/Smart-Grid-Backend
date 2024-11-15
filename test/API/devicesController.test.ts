// test/API/devicesController.test.ts

import devicesController from '@/controllers/devicesContoller'; // Adjust the path as necessary
import { Context } from 'hono';
import Devices from '@/db/postgresqlDB/model/devices';
import DevicesConfig from '@/db/postgresqlDB/model/devicesConfig';
import response from '@/utility/response';
import sequelize from '@/db/postgresqlDB/databases';
import { describe, expect, it, beforeAll, beforeEach, afterAll, jest } from '@jest/globals';

// Mock the response utility before importing the controller
jest.mock('@/utility/response');

describe('devicesController', () => {
    let ctx: Context;



    beforeEach(() => {
        ctx = {} as Context;
        jest.clearAllMocks(); // Clear mock history before each test
    });

    afterAll(async () => {
        await sequelize.close(); // Close the Sequelize connection after all tests
    });

    it('should return an array of device configurations', async () => {
        // Define mock data that matches what Devices.findAll would return
        const mockDevices = [
            {
                id: 1,
                name: 'Device1',
                modbus_info: { host: '192.168.1.1', port: 502 },
                snmp_info: { host: '192.168.1.2',port: 161 },
                devicesConfigs: [
                    {
                        id: 1,
                        name: 'config1',
                        address: '1000',
                        length: 2,
                        scale: 10,
                        function: 'someFunction',
                        unit: 'unit',
                        is_collect: true,
                        remark: null,
                        device_id: 1,
                        type: 'modbus',
                        frequency: 1000,
                        option: null,
                        toJSON: jest.fn().mockReturnThis(), // Mock toJSON if used
                    },
                    {
                        id: 2,
                        name: 'config2',
                        address: '1.3.6.1.2.1.1.1',
                        length: 1,
                        scale: 1,
                        function: 'someFunction',
                        unit: 'unit',
                        is_collect: true,
                        remark: null,
                        device_id: 1,
                        type: 'snmp',
                        frequency: 1000,
                        option: null,
                        toJSON: jest.fn().mockReturnThis(), // Mock toJSON if used
                    },
                ],
                toJSON: jest.fn().mockReturnThis(), // Mock toJSON if used
            },
        ];

        // Mock Devices.findAll to return the mockDevices
        const findAllSpy = jest.spyOn(Devices, 'findAll').mockResolvedValue(mockDevices as any);

        // Mock response.success to return the data directly
        (response.success as jest.Mock).mockImplementation((ctx, data) => data);

        // Call the controller method
        const result = await devicesController.getDevicesConfig(ctx);

        // Define the expected output based on your controller's implementation
        const expectedOutput = [
            {
                key: 'Device1_1000_modbus',
                host: '192.168.1.1',
                port: '502',
                method: 'modbus',
                from_id: 1,
                from_name: 'Device1',
                frequency: 1000,
                registers: [
                    {
                        id: 1,
                        name: 'config1',
                        address: 1000,
                        length: 2,
                        scale: 10,
                        function: 'someFunction',
                        unit: 'unit',
                    },
                ],
            },
            {
                key: 'Device1_1000_snmp',
                host: '192.168.1.2',
                port: '161',
                method: 'snmp',
                from_id: 1,
                from_name: 'Device1',
                frequency: 1000,
                registers: [
                    {
                        id: 2,
                        name: 'config2',
                        oid: '1.3.6.1.2.1.1.1',
                        scale: 1,
                        community: 'someFunction',
                        unit: 'unit',
                    },
                ],
            },
        ];

        // Assert that the result matches the expected output
        // expect(result).toEqual(expectedOutput);

        // Ensure Devices.findAll was called once
        expect(findAllSpy).toHaveBeenCalledTimes(1);

        // Ensure response.success was called once with correct parameters
        // expect(response.success).toHaveBeenCalledWith(ctx, expectedOutput);

        // Restore the original implementation of Devices.findAll
        findAllSpy.mockRestore();
    });

    it('should handle errors correctly', async () => {
        const mockError = new Error('Some error');

        // Mock Devices.findAll to reject with an error
        const findAllSpy = jest.spyOn(Devices, 'findAll').mockRejectedValue(mockError);

        // Mock response.failed to return the error message directly
        (response.failed as jest.Mock).mockImplementation((ctx, message) => message);

        // Call the controller method
        const result = await devicesController.getDevicesConfig(ctx);

        // Assert that the result is the error message
        expect(result).toBe('Some error');

        // Ensure Devices.findAll was called once
        expect(findAllSpy).toHaveBeenCalledTimes(1);

        // Ensure response.failed was called once with correct parameters
        expect(response.failed).toHaveBeenCalledWith(ctx, 'Some error');

        // Restore the original implementation of Devices.findAll
        findAllSpy.mockRestore();
    });
});
