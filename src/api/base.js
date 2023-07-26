import axios from 'axios';

export const api = axios.create({
  baseURL: `${process.env.REACT_APP_NATIONAL_URL}/api/v1`,
});

export const apiInternational = axios.create({
  baseURL: `${process.env.REACT_APP_INTERNATIONAL_URL}/api/v1`,
});
