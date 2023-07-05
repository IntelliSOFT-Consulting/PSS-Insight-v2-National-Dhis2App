import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import { Field, Input, TextArea } from '@dhis2/ui';
import { Button } from 'antd';
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
import { useParams } from 'react-router-dom';
import {
  formatVersionDetails,
  groupIndicatorsByVersion,
} from '../utils/helpers';
import Notification from '../components/Notification';
import useRedirect from '../hooks/redirect';
import { useDataEngine } from '@dhis2/app-runtime';
import { createLog } from '../api/logs';

const useStyles = createUseStyles({
  alertBar: {
    position: 'fixed !important',
    top: '3.5rem',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  hidden: {
    display: 'none',
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
  const [selectedIndicators, setSelectedIndicators] = useState([]);
  const [benchmarks, setBenchmarks] = useState([]);

  const { id } = useParams();
  const engine = useDataEngine();

  const queryBenchmarks = async () => {
    // get dataSets
    const { data } = await engine.query({
      data: {
        resource: 'dataSets',
        params: {
          fields: 'id,name',
          paging: false,
          filter: 'name:ilike:Benchmark',
        },
      },
    });

    const { data: dataElements } = await engine.query({
      data: {
        resource: 'dataElements',
        params: {
          fields: 'id,name,displayName',
          paging: false,
          filter: 'name:ilike:Benchmark',
        },
      },
    });

    if (data?.dataSets?.length > 0 && dataElements?.dataElements?.length > 0) {
      const dataSetId = data?.dataSets[0]?.id;
      const { data: dataValues } = await engine.query({
        data: {
          resource: 'dataValueSets',
          params: {
            orgUnit: user?.me?.organisationUnits[0]?.id,
            period: new Date().getFullYear() - 1,
            dataSet: dataSetId,
            paging: false,
            fields: 'dataElement,value,displayName',
          },
        },
      });
      const benchmarkData = dataElements?.dataElements?.map(element => {
        const dataValue = dataValues?.dataValues?.find(
          value => value.dataElement === element.id
        );
        return {
          id: element.id,
          name: element.displayName?.replace('Benchmark', '')?.replace('_', ''),
          value: dataValue?.value || 0,
        };
      });
      setBenchmarks(benchmarkData);
      return benchmarkData;
    }
    return [];
  };

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
        let response;
        if (id) {
          const data = {
            versionDescription: values.versionDescription,
            isPublished: values.isPublished,
            publishedBy: values.isPublished ? user?.me?.username : null,
            indicators: selectedIndicators,
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
            indicators: selectedIndicators,
          };
          response = await saveTemplate(data);
        }

        await createLog({
          country: user?.me?.organisationUnits[0]?.name,
          changes: `Template ${id ? 'updated' : 'created'}`,
          indicator: values.versionDescription,
        });

        if (response) {
          setSuccess('Template saved successfully');
          setError(false);

          window.scrollTo(0, 0);
          formik.resetForm();
        }
      } catch (error) {
        setError('Something went wrong while saving the template');
        setSuccess(false);
      }
    },
  });

  useRedirect('/templates/versions', 1000, success);

  const getIndicatorDetails = async () => {
    try {
      setLoadingIndicators(true);
      const data = await getVersionDetails(id);

      const formattedData = formatVersionDetails(data);

      setDetails(formattedData);
      setSelectedIndicators(formattedData.indicators);

      formik.setValues(formattedData);

      setLoadingIndicators(false);
    } catch (error) {
      setError('Something went wrong while fetching the template');
      setLoadingIndicators(false);
    }
  };

  const getIndicators = async () => {
    try {
      await queryBenchmarks();

      const data = await getInternationalIndicators();
      const sortedIndicators = groupIndicatorsByVersion(data);
      setIndicators(sortedIndicators);
      setLoadingIndicators(false);
    } catch (error) {
      console.log(error);
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

  useEffect(() => {
    if (formik.errors.versionDescription && formik.touched.versionDescription) {
      const descriptionRef = document.getElementById('versionDescription');
      descriptionRef.scrollIntoView({ behavior: 'smooth' });
      descriptionRef.focus();
    }
  }, [formik.errors.versionDescription, formik.touched.versionDescription]);

  const footer = (
    <div className={classes.cardFooter}>
      <Button
        name='Small button'
        onClick={formik.handleReset}
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
        value='default'
        className={classes.btnPublish}
        loading={formik.isSubmitting && formik.values.isPublished}
      >
        Publish template
      </Button>
      <Button
        name='Small button'
        onClick={formik.handleSubmit}
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
        <Notification
          status='success'
          onClose={() => setSuccess(false)}
          message={success}
        >
          {success}
        </Notification>
      )}
      {error && (
        <Notification
          status='error'
          onClose={() => setError(false)}
          message={error}
        >
          {error}
        </Notification>
      )}
      <form className={classes.formGrid}>
        <Field
          label='Version Number'
          className={styles.hidden}
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
            id='versionDescription'
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
            {indicators?.map(item => (
              <Accordion key={item.categoryName} title={item.categoryName}>
                {item?.indicators?.map(indicator => (
                  <IndicatorStack
                    disabled={isView}
                    key={indicator.categoryId}
                    updateIndicators={updateIndicators}
                    indicator={indicator}
                    onChange={() => {}}
                    formik={formik}
                    isView={isView}
                    userId={user?.me?.username}
                    referenceSheet={item.referenceSheet}
                    selectedIndicators={selectedIndicators}
                    setSelectedIndicators={setSelectedIndicators}
                    benchmarks={benchmarks}
                    setBenchmarks={setBenchmarks}
                    orgUnit={user?.me?.organisationUnits[0]?.id}
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
