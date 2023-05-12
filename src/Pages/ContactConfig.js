import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Form, Input, Button } from 'antd';
import { createUseStyles } from 'react-jss';
import { createAbout } from '../api/configurations';
import Notification from '../components/Notification';

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
      console.log(error)
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
          <Input.TextArea size='large' placeholder='Contact us' rows={4}/>
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
          <Input.TextArea size='large' placeholder='About us' rows={4} />
        </Form.Item>
      </Form>
    </Card>
  );
}
