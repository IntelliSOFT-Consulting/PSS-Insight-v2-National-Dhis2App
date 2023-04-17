import React from 'react';
import Modal from './Modal';
import { DatePicker, Input } from 'antd';
import { createUseStyles } from 'react-jss';
import moment from 'moment';

const useStyles = createUseStyles({
  input: {
    width: '100%',
    marginBottom: '1rem',
  },
});

export default function Resend({ Form, form, ...props }) {
  const classes = useStyles();

  return (
    <Modal key={props.key} title='Resend Survey' {...props}>
      <Form form={form} layout='vertical' onFinish={props.onFinish}>
        <Form.Item
          label='Enter Comments to Respondents'
          name='comments'
          rules={[
            {
              required: true,
              message: 'Please enter comments',
            },
          ]}
        >
          <Input.TextArea
            className={classes.input}
            placeholder='Entercomments'
            rows={3}
          />
        </Form.Item>
        <Form.Item
          label='Enter Expiry Date'
          name='expiryDateTime'
          rules={[
            {
              required: true,
              message: 'Please select expiry date',
            },
          ]}
        >
          <DatePicker
            size='large'
            className={classes.input}
            placeholder='Select expiry date'
            disabledDate={current =>
              current && current < moment().subtract(1, 'days')
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
