import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import {
  getSurveySubmission,
  resendSurveySubmission,
} from '../api/surveySubmissions';
import HorizontalTable from '../components/HorizontalTable';
import { createUseStyles } from 'react-jss';
import { useParams } from 'react-router-dom';
import { displayDetails } from '../utils/helpers';
import ResponseGrid from '../components/ResponsesGrid';
import Loader from '../components/Loader';
import Notification from '../components/Notification';
import { Button, DatePicker, Form } from 'antd';
import Resend from '../components/Resend';
import moment from 'moment';
import { format } from 'date-fns';
import Title from '../components/Title';
import { useFormik } from 'formik';

const useStyles = createUseStyles({
  header: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
  },
  btnSuccess: {
    backgroundColor: '#218838 !important',
    color: 'white !important',
    borderColor: '#218838 !important',
  },
  btnPublish: {
    backgroundColor: '#0067b9 !important',
    color: 'white !important',
    borderColor: '#0067b9 !important',
  },
  btnCancel: {
    backgroundColor: '#aaaaaa !important',
    color: 'white !important',
    borderColor: '#aaaaaa !important',
  },
  cardFooter: {
    margin: 0,
    fontSize: '14px',
    display: 'flex',
    justifyContent: ({ isExpired }) => (isExpired ? 'flex-start' : 'flex-end'),
    width: '100%',
    flexDirection: ({ isExpired }) => (isExpired ? 'row-reverse' : 'row'),

    '& > button': {
      marginLeft: '10px',
    },
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  expired: {
    margin: '1.5rem 0',
  },
});

export default function Response() {
  const [surveySubmission, setSurveySubmission] = useState(null);
  const [newExpiry, setNewExpiry] = useState(null);
  const [selectedIndicators, setSelectedIndicators] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [form] = Form.useForm();

  const [showResend, setShowResend] = useState(false);

  const { id } = useParams();

  useEffect(() => {
    const fetchSurveySubmission = async () => {
      setLoading(true);
      try {
        const data = await getSurveySubmission(id);
        if (data.respondentDetails.status === 'PENDING') data.responses = [];
        const populateAnswers = displayDetails(data);
        data.questions = populateAnswers;
        setSurveySubmission(data);
      } catch (error) {
        setError(
          'Something went wrong. Please refresh the page and try again.'
        );
      }
      setLoading(false);
    };
    fetchSurveySubmission();
  }, [id]);

  const col1 = [
    { title: 'Survey Name', index: 'surveyName' },
    {
      title: 'Survey Description',
      index: 'surveyDescription',
    },
  ];

  const col2 = [
    { title: 'Respondents Email', index: 'emailAddress' },
    {
      title: 'Date Filled',
      index: 'dateFilled',
    },
  ];

  const isExpired = date => {
    const now = new Date();
    const expiry = new Date(date);
    const hasResponded =
      surveySubmission?.responses?.filter(item => item.response).length > 0;
    return now > expiry && !hasResponded;
  };

  const resendSurvey = async (values = {}) => {
    try {
      values.expiryDateTime = new Date(values.expiryDateTime);

      console.log(
        'date 1: ',
        values.expiryDateTime,
        format(
          new Date(values.expiryDateTime.setHours(23, 59, 59, 999)),
          'yyyy-MM-dd hh:mm:ss'
        )
      );
      const ids = surveySubmission.questions
        .map(category => {
          return category.indicators.map(indicator => indicator.categoryId);
        })
        .flat();

      const payload = isExpired(surveySubmission?.respondentDetails?.expiresAt)
        ? {
            indicators: ids,
            expiryDateTime: format(
              new Date(new Date(newExpiry).setHours(23, 59, 59, 999)),
              'yyyy-MM-dd hh:mm:ss'
            ),
          }
        : {
            indicators: selectedIndicators,
            comments: values.comments,
            surveyId: id,
            expiryDateTime: format(
              new Date(values.expiryDateTime.setHours(23, 59, 59, 999)),
              'yyyy-MM-dd hh:mm:ss'
            ),
          };
      const data = await resendSurveySubmission(
        payload,
        surveySubmission.respondentDetails.id
      );

      setShowResend(false);
      setSuccess('Survey resent successfully!');
      form.resetFields();
    } catch (error) {
      console.log(error);
      setError('Something went wrong. Please refresh the page and try again.');
    }
  };
  const classes = useStyles({
    isExpired: isExpired(surveySubmission?.respondentDetails?.expiresAt),
  });

  const handleConfirm = () => {
    try {
      console.log('confirm');
    } catch (error) {
      setError('Something went wrong. Please refresh the page and try again.');
    }
  };

  const footer = (
    <div className={classes.cardFooter}>
      <Button
        name='Small Primary button'
        onClick={() => {
          isExpired(surveySubmission?.respondentDetails?.expiresAt)
            ? resendSurvey()
            : setShowResend(true);
        }}
        small
        value='default'
        className={classes.btnPublish}
      >
        Resend
      </Button>
      <Button
        name='Small button'
        // onClick={formik.handleReset}
        small
        value='default'
        className={classes.btnCancel}
      >
        Reject
      </Button>
      {!isExpired(surveySubmission?.respondentDetails?.expiresAt) && (
        <Button
          name='Small button'
          // onClick={() => setShowModal(true)}
          small
          value='default'
          className={classes.btnSuccess}
        >
          Confirm
        </Button>
      )}
    </div>
  );

  const submitFooter = (
    <div className={classes.modalFooter}>
      <Button className={classes.btnSuccess} onClick={() => form.submit()}>
        Submit
      </Button>
    </div>
  );

  return (
    <Card title='RESPONSE' footer={surveySubmission ? footer : null}>
      <Resend
        open={showResend}
        onCancel={() => {
          setShowResend(false);
        }}
        onFinish={resendSurvey}
        footer={submitFooter}
        Form={Form}
        form={form}
        id={surveySubmission?.respondentDetails?.id}
      />
      {error && (
        <Notification
          message={error}
          status='error'
          onClose={() => setError(null)}
          id='error'
        />
      )}
      {success && (
        <Notification
          message={success}
          status='success'
          onClose={() => setSuccess(null)}
          key='success'
        />
      )}
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className={classes.header}>
            <HorizontalTable
              headers={col1}
              data={{
                surveyName: surveySubmission?.respondentDetails?.surveyName,
                surveyDescription:
                  surveySubmission?.respondentDetails?.surveyDescription,
              }}
            />
            <HorizontalTable
              headers={col2}
              data={{
                emailAddress: surveySubmission?.respondentDetails?.emailAddress,
                dateFilled:
                  surveySubmission?.respondentDetails?.dateFilled ? format(
                    new Date(surveySubmission?.respondentDetails?.dateFilled), 'dd/MM/yyyy'
                  )  : '-',
              }}
            />
          </div>
          <div>
            {isExpired(surveySubmission?.respondentDetails?.expiresAt) ? (
              <div className={classes.expired}>
                <Title text='Set Expiration Date' />
                <DatePicker
                  label='Enter Expiry Date'
                  name='expirydate'
                  size='large'
                  style={{ width: '40%' }}
                  onChange={value => {
                    format(value, 'yyyy-MM-dd HH:mm:ss');
                  }}
                  value={newExpiry}
                  required
                  disabledDate={current =>
                    current && current < moment().subtract(1, 'days')
                  }
                />
              </div>
            ) : (
              surveySubmission?.questions?.map((question, index) => (
                <div key={index}>
                  {question.indicators?.length > 0 && (
                    <Title text={question.categoryName} />
                  )}
                  <div>
                    {question.indicators.map((indicator, index) => (
                      <ResponseGrid
                        selectedIndicators={selectedIndicators}
                        setSelectedIndicators={setSelectedIndicators}
                        key={index}
                        indicator={indicator}
                        referenceSheet={
                          surveySubmission?.respondentDetails?.referenceSheet
                        }
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </Card>
  );
}
