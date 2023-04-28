import axios from 'axios';

const api = axios.create({
  baseURL: 'http://172.104.91.99:7001/api/v1',
});

export const getNotifications = async (params = {}) => {
  const { data } = await api.get('/notification/list', { params });
  return data;
};

export const subScribeToNotifications = async payload => {
  const { data } = await api.post('/notification/subscribe', payload);
  return data;
};

export const unSubscribeToNotifications = async payload => {
  const { data } = await api.put('/notification/unsubscribe', payload);
  return data;
};
