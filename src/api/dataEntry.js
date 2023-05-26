import { api } from './base';
import axios from 'axios';

// const cancelToken = axios.CancelToken;
export const listDataEntry = async params => {
  const { data } = await api.get('/data-entry/response', {
    params,
    // cancelToken: new cancelToken(function executor(c) {
    //   // An executor function receives a cancel function as a parameter
    //   params.cancel = c;
    // }),
  });
  return data;
};

export const getdataEntryDetails = async dataEntryId => {
  const { data } = await api.get(`/data-entry/response/${dataEntryId}`);
  return data;
};

export const confirmEntry = async dataEntryId => {
  const { data } = await api.put(`/data-entry/${dataEntryId}/verify`);
  return data;
};

export const rejectEntry = async dataEntryId => {
  const { data } = await api.put(`/data-entry/${dataEntryId}/reject`);
  return data;
};
