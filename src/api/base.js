import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://172.104.91.99:7001/api/v1',
});
