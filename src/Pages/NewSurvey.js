import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import { Field, TextArea, AlertBar } from '@dhis2/ui';
import { Button, Form, Input, Select, DatePicker } from 'antd';
import {
  addRespondents,
  addSurvey,
  getSurvey,
  updateSurvey,
} from '../api/surveySubmissions';
import { getNationalIndicators } from '../api/api';
import classes from '../App.module.css';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Title from '../components/Title';
import SurveyIndicatorStack from '../components/SurveyIndicatorStack';
import Accordion from '../components/Accordion';
import Loading from '../components/Loader';
import { createUseStyles } from 'react-jss';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import { format } from 'date-fns';
import moment from 'moment';
import { formatSurveyDetails, sortIndicators } from '../utils/helpers';
import Notification from '../components/Notification';

const useStyles = createUseStyles({
  alertBar: {
    position: 'fixed !important',
    top: '3.5rem',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
  },
  input: {
    width: '100%',
    marginBottom: '1rem',
    marginTop: '1rem',
  },
  submit: {
    width: '100%',
    margin: '1rem 0',
    display: 'flex',
    justifyContent: 'flex-end',
  },
});

const validationSchema = Yup.object({
  surveyDescription: Yup.string().required('Description is required'),
  surveyName: Yup.string().required('Name is required'),
});

const options = [];
for (let i = 10; i < 36; i++) {
  options.push({
    value: i.toString(36) + i,
    label: i.toString(36) + i,
  });
}

export default function NewSurvey({ user }) {
  const [loadingIndicatrors, setLoadingIndicators] = useState(true);
  const [indicators, setIndicators] = useState([]);
  const [success, setSuccess] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [surveyDetails, setSurveyDetails] = useState({});
  const [referenceSheet, setReferenceSheet] = useState('');

  const { id } = useParams();
  const navigate = useNavigate();

  const isView = window.location.href.includes('view');

  const styles = useStyles();
  const formik = useFormik({
    initialValues: {
      surveyDescription: '',
      surveyName: '',
      surveyLandingPage: '',
      status: false,
    },
    validationSchema,
    onSubmit: async values => {
      try {
        if (id) {
          values = { ...surveyDetails, ...values };
        }
        const indicatorValues = Object.keys(values)
          .filter(
            value =>
              value &&
              value !== 'surveyName' &&
              value !== 'surveyDescription' &&
              value !== 'status' &&
              value !== 'expiryDateTime' &&
              value !== 'email' &&
              value !== 'surveyLandingPage'
          )
          .filter(item => values[item]);

        const data = {
          creatorId: user?.me?.id,
          surveyName: values.surveyName,
          surveyDescription: values.surveyDescription,
          surveyLandingPage: values.surveyLandingPage,
          isSaved: values.status === 'PUBLISHED',
          indicators: indicatorValues,
        };

        const response = id
          ? await updateSurvey(id, data)
          : await addSurvey(data);
        if (response) {
          if (values.status === 'PUBLISHED') {
            setSending(true);
            const reponse = await addRespondents({
              surveyId: response?.id,
              customAppUrl: `http://pssinternational.intellisoftkenya.com:3001/survey`,
              expiryDateTime: format(
                new Date(values.expiryDateTime),
                'yyyy-MM-dd HH:mm:ss'
              ),
              emailAddressList: values.email,
            });
            if (reponse) setSending(false);
            setSuccess('Survey sent successfully');
          }
          setSuccess('Survey saved successfully');
          setShowModal(false);
          setError(false);
          setTimeout(() => {
            setSuccess(false);
            navigate('/surveys/menu');
          }, 1000);
        }
      } catch (error) {
        setSending(false);
        setError('Something went wrong, please try again later');
        setSuccess(false);
      }
    },
  });

  const getIndicators = async () => {
    try {
      const data = await getNationalIndicators();
      setReferenceSheet(data?.referenceSheet);
      const sortedIndicators = sortIndicators(data?.details);
      setIndicators(sortedIndicators);
      setLoadingIndicators(false);
    } catch (error) {
      setError('Something went wrong, please try again later');
      setLoadingIndicators(false);
    }
  };

  const loadSurvey = async () => {
    try {
      const data = await getSurvey(id);
      const formatted = formatSurveyDetails(data);
      setSurveyDetails(formatted);
      formik.setValues(formatted);
    } catch (error) {
      setError('Something went wrong, please try again later');
    }
  };

  useEffect(() => {
    getIndicators();
    if (id) loadSurvey();
  }, [id]);

  useEffect(() => {
    if (success) {
      formik.resetForm();
      const successTimeout = setTimeout(() => {
        setSuccess(false);
      }, 3000);

      return () => clearTimeout(successTimeout);
    }
  }, [success]);

  const footer = (
    <div className={classes.cardFooter}>
      <Button
        name='Small button'
        onClick={formik.handleReset}
        small
        value='default'
        className={classes.btnCancel}
      >
        Cancel
      </Button>
      <Button
        name='Small Primary button'
        onClick={() => {
          formik.setFieldValue('status', 'SAVED');
          formik.handleSubmit();
        }}
        small
        value='default'
        className={classes.btnPublish}
        loading={formik.isSubmitting && formik.values.status === 'SAVED'}
      >
        Save Draft
      </Button>
      <Button
        name='Small button'
        onClick={() => {
          const indicatorValues = Object.keys(formik.values)
            .filter(
              value =>
                value &&
                value !== 'surveyName' &&
                value !== 'surveyDescription' &&
                value !== 'status' &&
                value !== 'expiryDateTime' &&
                value !== 'email' &&
                value !== 'surveyLandingPage'
            )
            .filter(item => formik.values[item]);
          if (indicatorValues.length > 0) {
            setShowModal(true);
          } else {
            setError('Please select at least one indicator');
          }
        }}
        small
        value='default'
        className={classes.btnSuccess}
      >
        Send Survey
      </Button>
    </div>
  );

  return (
    <Card title='Create a Survey' footer={isView ? null : footer}>
      {success && (
        <Notification
          status='success'
          message={success}
          onClose={() => setSuccess(false)}
        />
      )}
      {error && (
        <Notification
          status='error'
          message={error}
          onClose={() => setError(false)}
        />
      )}
      <form className={classes.formGrid}>
        <Field
          label='Survey Name'
          name='surveyName'
          validationText={
            formik.errors.surveyName && formik.touched.surveyName
              ? formik.errors.surveyName
              : null
          }
          error={formik.errors.surveyName && formik.touched.surveyName}
          required
        >
          <Input
            name='surveyName'
            onChange={e => {
              formik.setFieldValue('surveyName', e.target.value);
            }}
            placeholder='Survey Name'
            size='large'
            value={formik.values.surveyName}
            error={formik.errors.surveyName && formik.touched.surveyName}
          />
        </Field>

        <Field
          label='Description'
          required
          error={
            formik.errors.surveyDescription && formik.touched.surveyDescription
          }
          validationText={
            formik.errors.surveyDescription && formik.touched.surveyDescription
              ? formik.errors.surveyDescription
              : null
          }
        >
          <TextArea
            name='surveyDescription'
            onChange={({ value }) =>
              formik.setFieldValue('surveyDescription', value)
            }
            disabled={isView}
            placeholder='Description'
            rows={3}
            required
            value={formik.values.surveyDescription}
            error={
              formik.errors.surveyDescription &&
              formik.touched.surveyDescription
            }
          />
        </Field>

        <Field
          label='Landing Page Description'
          required
          error={
            formik.errors.surveyLandingPage && formik.touched.surveyLandingPage
          }
          validationText={
            formik.errors.surveyLandingPage && formik.touched.surveyLandingPage
              ? formik.errors.surveyLandingPage
              : null
          }
        >
          <TextArea
            name='surveyLandingPage'
            onChange={({ value }) =>
              formik.setFieldValue('surveyLandingPage', value)
            }
            disabled={isView}
            placeholder='Landing Page Description'
            rows={3}
            required
            value={formik.values.surveyLandingPage}
            error={
              formik.errors.surveyLandingPage &&
              formik.touched.surveyLandingPage
            }
          />
        </Field>
      </form>
      <div className={classes.indicatorsSelect}>
        <Title text='SELECT INDICATORS TO ADD' />
        {loadingIndicatrors ? (
          <Loading type='skeleton' />
        ) : (
          <div className={classes.indicators}>
            {indicators?.map(indicator => (
              <Accordion
                key={indicator.categoryName}
                title={indicator.categoryName}
              >
                {indicator.indicators.map(indicator => (
                  <SurveyIndicatorStack
                    disabled={isView}
                    key={indicator.id}
                    indicator={indicator}
                    onChange={() => {}}
                    formik={formik}
                    referenceSheet={referenceSheet}
                  />
                ))}
              </Accordion>
            ))}
          </div>
        )}
      </div>
      <Modal
        open={showModal}
        onCancel={() => setShowModal(false)}
        title='Enter Email'
        footer={null}
      >
        <Form
          layout='vertical'
          onFinish={values => {
            formik.setFieldValue('status', 'PUBLISHED');
            formik.handleSubmit();
          }}
        >
          <Form.Item
            label='Enter respondents email address'
            name='email'
            rules={[
              {
                required: true,
                message: 'At least one email is required',
              },
              {
                validator: (_, value) => {
                  if (value) {
                    const validEmails = value.filter(email => {
                      const re = /\S+@\S+\.\S+/;
                      return re.test(email);
                    });
                    if (validEmails.length !== value.length) {
                      return Promise.reject(
                        'Please enter a valid email address'
                      );
                    }
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Select
              mode='tags'
              placeholder='Email'
              onChange={value => formik.setFieldValue('email', value)}
              size='large'
            />
          </Form.Item>

          <Form.Item
            label='Enter expiry date'
            name='expiryDateTime'
            rules={[
              {
                required: true,
                message: 'Expiry date is required',
              },
            ]}
          >
            <DatePicker
              onChange={value => formik.setFieldValue('expiryDateTime', value)}
              placeholder='Expiry Date'
              disabledDate={current =>
                current && current < moment().endOf('day')
              }
              size='large'
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item className={styles.submit}>
            <Button
              name='Small Primary button'
              htmlType='submit'
              small
              value='default'
              className='btnSuccess'
              disabled={sending}
              loading={
                formik.isSubmitting && formik.values.status === 'PUBLISHED'
              }
            >
              Send
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
