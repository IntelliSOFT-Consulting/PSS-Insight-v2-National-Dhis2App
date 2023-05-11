import { api } from './base';

export const createAbout = async about => {
  const { data } = await api.post('/configuration/create-about-us', about);
  return data;
};
