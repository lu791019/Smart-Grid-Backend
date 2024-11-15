import lodash from 'lodash';
const { round } = lodash;

interface FlattenedObject {
  [key: string]: any;
}

const flattenObject = (
  obj: Record<string, any>,
  parentKey: string = '',
  result: FlattenedObject = {},
): FlattenedObject => {
  for (const [key, value] of Object.entries(obj)) {
    const newKey = parentKey ? `${parentKey}_${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      flattenObject(value, newKey, result);
    } else {
      result[newKey] = value;
    }
  }
  return result;
};

const processJson = (data: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'object' && value !== null) {
      result[key] = processJson(value);
    } else {
      result[key] = typeof value === 'number' ? round(value * 1, 1) : value;
    }
  }
  return result;
};

export { flattenObject, processJson };
