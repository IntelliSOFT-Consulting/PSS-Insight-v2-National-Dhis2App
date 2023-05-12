import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Form, Input, Button } from 'antd';
import { createUseStyles } from 'react-jss';
import { createAbout } from '../api/configurations';
import Notification from '../components/Notification';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const useStyles = createUseStyles({
  '@global': {
    '.ant-btn-primary': {
      background: '#218838',
      borderColor: '#218838',
      '&:hover': {
        background: '#139b48 !important',
        borderColor: '#139b48',
      },
    },
    '.ant-btn-default': {
      background: '#AAAAAA',
      borderColor: '#AAAAAA',
      color: '#fff',
      '&:hover': {
        background: '#AAAAAA !important',
        borderColor: '#AAAAAA !important',
        color: '#fff !important',
      },
    },
    '.ql-toolbar': {
      borderTopLeftRadius: '0.375rem',
      borderTopRightRadius: '0.375rem',
    },
    '.ql-container': {
      borderBottomLeftRadius: '0.375rem',
      borderBottomRightRadius: '0.375rem',
      '& .ql-editor': {
        minHeight: '200px',
      },
    },
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    '& >button': {
      '&:not(:last-child)': {
        marginRight: '1rem',
      },
    },
  },
  about: {},
});

export default function ContactConfig() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const classes = useStyles();
  const [form] = Form.useForm();

  const onFinish = async values => {
    try {
      const data = await createAbout(values);
      if (data) setSuccess('Contact configuration updated successfully');
    } catch (error) {
      console.log(error);
      setError('Something went wrong, please try again later');
    }
  };

  const footer = (
    <div className={classes.footer}>
      <Button
        type='default'
        form='email-config-form'
        onClick={() => form.resetFields()}
      >
        Cancel
      </Button>
      <Button
        type='primary'
        htmlType='submit'
        form='email-config-form'
        onClick={() => form.submit()}
        loading={form.submitting}
      >
        Save
      </Button>
    </div>
  );

  return (
    <Card title='CONTACT CONFIGURATION' footer={footer}>
      {error && (
        <Notification
          message={error}
          status='error'
          onClose={() => setError(null)}
        />
      )}
      {success && (
        <Notification
          message={success}
          status='success'
          onClose={() => setSuccess(null)}
        />
      )}
      <Form layout='vertical' form={form} onFinish={onFinish}>
        <Form.Item
          rules={[
            {
              required: true,
              message: 'Contact Us is required',
            },
          ]}
          label='Contact Us'
          name='contactUs'
        >
          <Input size='large' placeholder='Contact us' />
        </Form.Item>
        <Form.Item
          rules={[
            {
              required: true,
              message: 'About Us is required',
            },
          ]}
          label='About Us'
          name='aboutUs'
        >
          <ReactQuill theme='snow' className={classes.about} />
        </Form.Item>
      </Form>
    </Card>
  );
}