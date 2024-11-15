import { flattenObject, processJson } from '@/utility/processJson';

import _ from 'lodash';

import {describe, expect, it} from '@jest/globals';

describe('Utility Functions', () => {
    describe('flattenObject', () => {
        it('should flatten a nested object', () => {
            const input = {
                a: {
                    b: {
                        c: 1,
                        d: 'test',
                    },
                },
                e: 2,
            };
            const expectedOutput = {
                'a_b_c': 1,
                'a_b_d': 'test',
                'e': 2,
            };
            expect(flattenObject(input)).toEqual(expectedOutput);
        });

        it('should handle empty object', () => {
            const input = {};
            const expectedOutput = {};
            expect(flattenObject(input)).toEqual(expectedOutput);
        });
    });

    describe('processJson', () => {
        it('should round numbers to one decimal place', () => {
            const input = {
                a: 1.234,
                b: 2.789,
                c: {
                    d: 3.456,
                },
            };
            const expectedOutput = {
                a: _.round(1.234, 1),
                b: _.round(2.789, 1),
                c: {
                    d: _.round(3.456, 1),
                },
            };
            expect(processJson(input)).toEqual(expectedOutput);
        });

        it('should handle non-numeric values correctly', () => {
            const input = {
                a: 'string',
                b: true,
                c: null,
                d: { e: 1.234 },
            };
            const expectedOutput = {
                a: 'string',
                b: true,
                c: null,
                d: { e: _.round(1.234, 1) },
            };
            expect(processJson(input)).toEqual(expectedOutput);
        });

        it('should handle empty object', () => {
            const input = {};
            const expectedOutput = {};
            expect(processJson(input)).toEqual(expectedOutput);
        });
    });
});