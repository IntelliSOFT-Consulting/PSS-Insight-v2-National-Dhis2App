import axios from 'axios';

const api = axios.create({
  baseURL: 'http://172.104.91.99:7001/api/v1',
});

export const getOrganizationUnit = async () => {
  const { data } = await api.get('/national-instance/organisation-unit');
  return data;
};

export const getVersions = async params => {
  const { data } = await api.get('/national-template/list-versions', {
    params,
  });
  return data;
};

export const getVersionDetails = async version => {
  const { data } = await api.get(
    `/national-template/version-details/${version}`
  );
  return data;
};

export const getInternationalVersions = async () => {
  const { data } = await api.get('/international-version');
  return data;
};

export const getInternationalIndicators = async () => {
  const { data } = await api.get('/international-template/indicators');
  return data;
};

export const getNationalIndicators = async () => {
  const { data } = await api.get(
    '/national-template/published-indicators'
  );
  return data;
};

export const saveTemplate = async template => {
  const { data } = await api.post('/national-template/add-version', template);
  return data;
};

export const updateVersion = async (id, version) => {
  const { data } = await api.put(
    `national-template/version-details/${id}`,
    version
  );
  return data;
};

export const deleteVersion = async versionId => {
  const { data } = await api.delete(
    `/national-template/version-details/${versionId}`
  );
  return data;
};

export const updateIndicator = async datas => {
  const { data } = await api.post(
    '/national-template/edit-indicator',
    datas
  );
  return data;
};


