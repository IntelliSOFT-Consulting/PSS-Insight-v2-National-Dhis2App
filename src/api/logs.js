import { apiInternational } from './base';

export const createLog = async log => {
  try {
    const { data } = await apiInternational.post('/change-logs/save', log);
    return data;
  } catch (e) {
    console.log(e);
  }
};
