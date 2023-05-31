import { api } from './base';

export const createAbout = async about => {
  const { data } = await api.post('/configuration/create-about-us', about);
  return data;
};

export const aboutUsDetails = async () => {
  const { data } = await api.get('/configuration/list-about-us?isLatest=true');
  return data ? data[0] : {};
};
