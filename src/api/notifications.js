import { api } from './base';

export const getNotifications = async (params = {}) => {
  const { data } = await api.get('/notification/list', { params });
  return data;
};

export const subScribeToNotifications = async payload => {
  const { data } = await api.post('/notification/subscribe', payload);
  return data;
};

export const unSubscribeToNotifications = async payload => {
  const { data } = await api.put(
    `/notification/unsubscribe?email=${payload.email}`
  );
  return data;
};

export const getSubscrpitionDetails = async userId => {
  const { data } = await api.get(`/notification/subscription-details`, {
    params: { userId },
  });
  return data;
};

export const updateSubscriptionDetails = async payload => {
  const { data } = await api.put(
    `/api/v1/notification/update-subscription`,
    payload
  );
  return data;
};
