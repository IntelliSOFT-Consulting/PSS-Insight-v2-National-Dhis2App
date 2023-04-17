import axios from 'axios';

const api = axios.create({
  baseURL: 'http://172.104.91.99:7001/api/v1',
});

const mock = [
  {
    id: 1,
    title: 'Notification 1',
    description: 'Notification 1 description',
    isRead: false,
    createdAt: '2021-03-01T00:00:00.000Z',
    updatedAt: '2021-03-01T00:00:00.000Z',
  },
];

export const getNotifications = async (params = {}) => {
//   const { data } = await api.get('/notification/list', { params });
  return mock;
};
