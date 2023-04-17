import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import { Field, Input, TextArea, AlertBar } from '@dhis2/ui';
import { Button, Skeleton } from 'antd';
import {
  saveTemplate,
  getInternationalIndicators,
  getVersionDetails,
  updateVersion,
} from '../api/api';
import classes from '../App.module.css';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Title from '../components/Title';
import IndicatorStack from '../components/IndicatorStack';
import Accordion from '../components/Accordion';
import Loading from '../components/Loader';
import { createUseStyles } from 'react-jss';
import { useParams, useNavigate } from 'react-router-dom';
import {
  formatVersionDetails,
  groupIndicatorsByVersion,
} from '../utils/helpers';

const useStyles = createUseStyles({
  alertBar: {
    position: 'fixed !important',
    top: '3.5rem',
    left: '50%',
    transform: 'translateX(-50%)',
  },
});

const validationSchema = Yup.object({
  versionDescription: Yup.string().required('Description is required'),
});

export default function NewVersion({ user }) {
  const [loadingIndicatrors, setLoadingIndicators] = useState(true);
  const [details, setDetails] = useState(null);
  const [indicators, setIndicators] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  const isView = window.location.href.includes('view');

  const styles = useStyles();
  const formik = useFormik({
    initialValues: {
      versionDescription: '',
      isPublished: false,
    },
    validationSchema,
    onSubmit: async values => {
      try {
        const indicatorValues = Object.keys(values).filter(
          value =>
            value &&
            value !== 'versionName' &&
            value !== 'versionDescription' &&
            value !== 'isPublished' &&
            value !== 'createdBy' &&
            value !== 'status'
        );
        const getSelectedIndicators = indicatorValues
          .filter(item => values[item])
          .map(indicator => ({
            id: indicator?.split('-')[0],
            isLatest: indicator?.split('-')[1] ? true : false,
          }));
        let response;
        if (id) {
          const data = {
            versionDescription: values.versionDescription,
            isPublished: values.isPublished,
            publishedBy: values.isPublished ? user?.me?.username : null,
            indicators: getSelectedIndicators,
            createdBy: details?.createdBy,
          };

          response = await updateVersion(id, data);
        } else {
          const data = {
            createdBy: user?.me?.username,
            versionName: values.versionName,
            versionDescription: values.versionDescription,
            isPublished: values.isPublished,
            publishedBy: values.isPublished ? user?.me?.username : null,
            indicators: getSelectedIndicators,
          };
          response = await saveTemplate(data);
        }

        if (response) {
          setSuccess('Template saved successfully');
          setError(false);

          window.scrollTo(0, 0);
          setTimeout(() => {
            navigate('/templates/versions');
          }, 2000);
        }
      } catch (error) {
        setError('Something went wrong while saving the template');
        setSuccess(false);
      }
    },
  });

  const getIndicatorDetails = async () => {
    try {
      setLoadingIndicators(true);
      const data = await getVersionDetails(id);

      const formattedData = formatVersionDetails(data);

      setDetails(formattedData);

      formik.setValues(formattedData);

      setLoadingIndicators(false);
    } catch (error) {
      setError('Something went wrong while fetching the template');
      setLoadingIndicators(false);
    }
  };

  const getIndicators = async () => {
    try {
      const data = await getInternationalIndicators();
      const sortedIndicators = groupIndicatorsByVersion(data);
      setIndicators(sortedIndicators);
      setLoadingIndicators(false);
    } catch (error) {
      setError('Something went wrong while fetching the indicators');
      setLoadingIndicators(false);
    }
  };

  useEffect(() => {
    getIndicators();
    if (id) {
      getIndicatorDetails();
    }
    if (!id) formik.resetForm();
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

  const updateIndicators = (id, description) => {
    const updatedIndicators = indicators.map(category => {
      const updatedCategory = { ...category };

      if (category.indicators) {
        updatedCategory.indicators = category.indicators.map(indicator => {
          const updatedIndicator = { ...indicator };

          if (indicator.categoryId === id) {
            updatedIndicator.indicatorName = description;
          } else if (indicator.indicatorDataValue) {
            updatedIndicator.indicatorDataValue =
              indicator.indicatorDataValue.map(data => {
                const updatedData = { ...data };

                if (data.id === id) {
                  updatedData.name = description;
                }

                return updatedData;
              });
          }

          return updatedIndicator;
        });
      }

      return updatedCategory;
    });

    setIndicators(updatedIndicators);
  };

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
          formik.setFieldValue('isPublished', true);
          formik.handleSubmit();
        }}
        small
        value='default'
        className={classes.btnPublish}
        loading={formik.isSubmitting && formik.values.isPublished}
      >
        Publish template
      </Button>
      <Button
        name='Small button'
        onClick={formik.handleSubmit}
        small
        value='default'
        className={classes.btnSuccess}
        loading={formik.isSubmitting && !formik.values.isPublished}
      >
        Save
      </Button>
    </div>
  );

  return (
    <Card title='Create a Template' footer={isView ? null : footer}>
      {success && (
        <AlertBar
          duration={3000}
          icon
          success
          onHidden={() => setSuccess(false)}
          className={styles.alertBar}
        >
          {success}
        </AlertBar>
      )}
      {error && (
        <AlertBar
          duration={3000}
          icon
          critical
          onHidden={() => setError(false)}
          className={styles.alertBar}
        >
          {error}
        </AlertBar>
      )}
      <form className={classes.formGrid}>
        <Field
          label='Version Number'
          validationText={
            formik.errors.versionName && formik.touched.versionName
              ? formik.errors.versionName
              : null
          }
          error={formik.errors.versionName && formik.touched.versionName}
        >
          <Input
            name='versionName'
            onChange={({ value }) => formik.setFieldValue('versionName', value)}
            placeholder='Version number'
            disabled
            value={formik.values.versionName}
            error={formik.errors.versionName && formik.touched.versionName}
          />
        </Field>

        <Field
          label='Description'
          required
          error={
            formik.errors.versionDescription &&
            formik.touched.versionDescription
          }
          validationText={
            formik.errors.versionDescription &&
            formik.touched.versionDescription
              ? formik.errors.versionDescription
              : null
          }
        >
          <TextArea
            name='versionDescription'
            onChange={({ value }) =>
              formik.setFieldValue('versionDescription', value)
            }
            disabled={isView}
            placeholder='Description'
            rows={3}
            required
            value={formik.values.versionDescription}
            error={
              formik.errors.versionDescription &&
              formik.touched.versionDescription
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
                {indicator?.indicators?.map(indicator => (
                  <IndicatorStack
                    disabled={isView}
                    key={indicator.categoryId}
                    updateIndicators={updateIndicators}
                    indicator={indicator}
                    onChange={() => {}}
                    formik={formik}
                    isView={isView}
                    userId={user?.me?.username}
                  />
                ))}
              </Accordion>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
