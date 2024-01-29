import React from 'react';
import Card from '../components/Card';
import { Form, Input, Button } from 'antd';
import { createUseStyles } from 'react-jss';

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
  form: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridGap: '2rem',
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

export default function EmailConfig() {
  const classes = useStyles();
  const [form] = Form.useForm();

  const onFinish = values => {
    console.log('Received values of form: ', values);
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
      >
        Save
      </Button>
    </div>
  );

  return (
    <Card title='MAIL SERVER CONFIGURATIONS' footer={footer}>
      <Form
        layout='vertical'
        form={form}
        onFinish={onFinish}
        className={classes.form}
      >
        <Form.Item
          rules={[
            {
              required: true,
              message: 'Server is required',
            },
          ]}
          label='Server'
          name='server'
        >
          <Input size='large' placeholder='Server' />
        </Form.Item>
        <Form.Item
          rules={[
            {
              required: true,
              message: 'Port is required',
            },
          ]}
          label='Port'
          name='port'
        >
          <Input size='large' placeholder='Port' />
        </Form.Item>
        <Form.Item
          rules={[
            {
              required: true,
              message: 'Username is required',
            },
          ]}
          label='Username'
          name='username'
        >
          <Input size='large' placeholder='Username' />
        </Form.Item>
        <Form.Item
          rules={[
            {
              required: true,
              message: 'Password is required',
            },
          ]}
          label='Password'
          name='password'
        >
          <Input size='large' type='password' placeholder='Password' />
        </Form.Item>
      </Form>
    </Card>
  );
}
