import React from 'react';
import { Field, Input } from '@dhis2/ui';
import * as yup from 'yup';
import { useFormik } from 'formik';
import classes from '../App.module.css';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  input: {
    width: '100%',
    marginBottom: '1rem',
    marginTop: '1rem',
  },
});

const validationSchema = yup.object({
  email: yup.string().required('Required'),
  expiryDateTime: yup.date().required('Required'),
});

export default function SendSurvey({response}) {
  const styles = useStyles();
  const formik = useFormik({
    initialValues: {
      email: '',
      expiryDateTime: '',
    },
    validationSchema,
    onSubmit: values => {
        
      console.log(values);
    },
  });

  return (
    <form>
      <Field
        label='Enter respondents email address'
        required
        error={formik.errors.email && formik.touched.email}
        validationText={
          formik.errors.email && formik.touched.email
            ? formik.errors.email
            : null
        }
        className={styles.input}
      >
        <Input
          name='email'
          onChange={({ value }) => formik.setFieldValue('email', value)}
          placeholder='Email'
          value={formik.values.email}
          error={formik.errors.email && formik.touched.email}
        />
      </Field>
      <Field
        label='Enter expiry date'
        className={classes.input}
        required
        error={formik.errors.expiryDateTime && formik.touched.expiryDateTime}
        validationText={
          formik.errors.expiryDateTime && formik.touched.expiryDateTime
            ? formik.errors.expiryDateTime
            : null
        }
      >
        <Input
          name='expiryDateTime'
          type='date'
          onChange={({ value }) =>
            formik.setFieldValue('expiryDateTime', value)
          }
          placeholder='Expiry Date'
          value={formik.values.expiryDateTime}
          error={formik.errors.expiryDateTime && formik.touched.expiryDateTime}
        />
      </Field>
    </form>
  );
}
