import { api } from './base';

export const getSurveySubmissions = async (filter, limit, pageNo) => {
  const { data } = await api.get('/survey', {
    params: {
      filter,
      limit,
      pageNo,
    },
  });
  return data;
};

export const getSurveySubmission = async id => {
  const { data } = await api.get(
    `/survey-respondents/details/${id}?responses=true&respondentDetails=true&questions=true`
  );
  return data;
};

export const verifySurveySubmission = async respondentId => {
  const { data } = await api.put(
    `/survey-respondents/${respondentId}/verify-survey`
  );
  return data;
};

export const rejectSurveySubmission = async respondentId => {
  const { data } = await api.put(`/survey-respondents/${respondentId}/reject-survey`);
  return data;
};

export const addSurvey = async survey => {
  const { data } = await api.post('/survey/add', survey);
  return data;
};

export const addRespondents = async respondents => {
  const { data } = await api.post('/survey-respondents/add', respondents);
  return data;
};

export const listRespondents = async creatorId => {
  const { data } = await api.get(`/survey/admin-respondents/${creatorId}`);
  return data;
};

export const listSurveys = async (creatorId, status = '') => {
  const { data } = await api.get(`/survey/list/${creatorId}`, {
    params: {
      status,
    },
  });
  return data;
};

export const getSurvey = async id => {
  const { data } = await api.get(`/survey/survey-details/${id}`);
  return data;
};

export const updateSurvey = async (id, survey) => {
  const { data } = await api.put(`/survey/survey-details/${id}`, survey);
  return data;
};

export const getDataEntryDetails = async (surveyId, respondentId) => {
  const { data } = await api.get(
    `/survey/data-entry-details/${surveyId}/${respondentId}`
  );
  return data;
};

export const resendSurveySubmission = async (survey, respondentId) => {
  const { data } = await api.post(
    `/survey-respondents/resend-survey/${respondentId}`,
    survey
  );
  return data;
};
