import { api } from './base';

export const getReferences = async () => {
  const { data } = await api.get(
    '/indicator-reference/list-indicator-reference'
  );
  return data;
};

export const createReference = async reference => {
  const { data } = await api.post(
    '/indicator-reference/add-indicator-reference',
    reference
  );
  return data;
};

export const getReferenceDetails = async id => {
  const { data } = await api.get(
    `/indicator-reference/list-indicator-reference/${id}`
  );
  return data;
};

export const deleteReference = async id => {
  const { data } = await api.delete(
    `/indicator-reference/delete-indicator-reference/${id}`
  );
  return data;
};

export const updateReference = async (id, reference) => {
  const { data } = await api.put(
    `/indicator-reference/update-indicator-reference/${id}`,
    reference
  );
  return data;
};

export const getDropdowns = async () => {
  const { data } = await api.get('/indicator-reference/list-topics');
  return data;
};
