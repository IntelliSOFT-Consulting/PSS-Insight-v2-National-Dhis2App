import React, { useContext, useEffect, useRef, useState } from 'react';
import Card from '../components/Card';
import { Button, Table, Form, Input } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { PencilSquareIcon } from '@heroicons/react/24/solid';
import { createUseStyles } from 'react-jss';
import {
  subScribeToNotifications,
  unSubscribeToNotifications,
} from '../api/notifications';
import Notification from '../components/Notification';

const useStyles = createUseStyles({
  cardFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    margin: '1rem',
  },
  buttonDanger: {
    backgroundColor: '#FD0C0B',
    color: '#fff',
    border: 'none',
    marginRight: '5px',
  },
  buttonDisabled: {
    backgroundColor: '#E0E0E0',
    color: '#fff',
    border: 'none',
    marginRight: '5px',
  },
  buttonSuccess: {
    backgroundColor: '#218838',
    color: '#fff',
    border: 'none',
    marginRight: '5px',
  },

  iconSize: {
    width: '1rem',
    height: '1rem',
    color: '#0067b9',
  },

  tableGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridGap: '1rem',
    'media (max-width: 768px)': {
      gridTemplateColumns: 'repeat(1, 1fr)',
    },
  },
});

const EditableContext = React.createContext(null);
const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  isEdited,
  setEditing,
  ...restProps
}) => {
  const inputRef = useRef(null);
  const form = useContext(EditableContext);

  useEffect(() => {
    if (isEdited === record?.key && inputRef.current) {
      form.setFieldsValue({
        [record?.key]: record?.value,
      });
      inputRef.current?.focus();
    }
  }, [isEdited]);
  const toggleEdit = () => {
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };
  const save = async () => {
    setEditing(null);
    try {
      const values = await form.validateFields();

      handleSave({
        ...record,
        ...values,
      });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };
  let childNode = children;

  const emailValidation = [
    {
      required: true,
      message: 'Please input your email!',
    },
    {
      type: 'email',
      message: 'The input is not valid E-mail!',
    },
  ];

  if (editable) {
    childNode =
      isEdited === record?.key ? (
        <Form.Item
          style={{
            margin: 0,
          }}
          name={dataIndex}
          rules={
            record?.key === 'email'
              ? emailValidation
              : [{ required: true, message: `${title} is required` }]
          }
        >
          <Input ref={inputRef} onPressEnter={save} onBlur={save} />
        </Form.Item>
      ) : (
        <div
          className='editable-cell-value-wrap'
          style={{
            paddingRight: 24,
          }}
        >
          {children}
        </div>
      );
  }

  return <td {...restProps}>{childNode}</td>;
};

export default function NotificationSettings() {
  const [editing, setEditing] = useState(null);
  const [values, setValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const classes = useStyles();

  const defaultColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '8rem',
    },
    {
      title: 'value',
      dataIndex: 'value',
      key: 'value',
      editable: true,
    },
    {
      title: 'Action',
      render: record => {
        return (
          <Button
            type='ghost'
            onClick={() => {
              setEditing(record.key);
            }}
          >
            {editing === record.key ? (
              <SaveOutlined
                className={classes.iconSize}
                style={{ color: '#218838' }}
              />
            ) : (
              <PencilSquareIcon className={classes.iconSize} />
            )}
          </Button>
        );
      },
      width: '3rem',
      editButton: true,
    },
  ];

  const handleSave = row => {
    setValues({
      ...values,
      [row?.key]: row.value,
    });
  };
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columns = defaultColumns.map(col => {
    if (!col.editable && !col.editButton) {
      return col;
    }
    return {
      ...col,
      onCell: record => ({
        record,
        editable: col.editable,
        isEdited: editing,
        setEditing: setEditing,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  const handleReset = () => {
    setValues({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
    });
  };

  const handleSubscribe = async () => {
    try {
      const data = await subScribeToNotifications(values);
      setSuccess('You have successfully subscribed to notifications');

      handleReset();
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      setError('Something went wrong');
    }
  };

  const handleUnsubscribe = async () => {
    try {
      const data = await unSubscribeToNotifications(values);
      setSuccess('You have successfully unsubscribed from notifications');

      handleReset();
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      setError('Something went wrong');
    }
  };

  const footer = (
    <div className={classes.cardFooter}>
      <Button
        className={classes.buttonDanger}
        type='danger'
        onClick={handleUnsubscribe}
      >
        Unsubscribe
      </Button>
      <Button
        className={classes.buttonDisabled}
        type='disabled'
        onClick={() => {
          setEditing(null);
          handleReset();
        }}
      >
        Cancel
      </Button>
      <Button
        className={classes.buttonSuccess}
        type='success'
        onClick={handleSubscribe}
      >
        Save
      </Button>
    </div>
  );
  const data1 = [
    {
      key: 'firstName',
      name: 'First Name:',
      value: values.firstName,
    },
    {
      key: 'lastName',
      name: 'Last Name:',
      value: values.lastName,
    },
  ];

  const data2 = [
    {
      key: 'email',
      name: 'Email Address:',
      value: values.email,
    },
    {
      key: 'phoneNumber',
      name: 'Phone Number:',
      value: values.phoneNumber,
    },
  ];
  return (
    <Card title='NOTIFICATION SETTINGS' style={{ padding: 16 }} footer={footer}>
      {success && (
        <Notification
          status='success'
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}
      {error && (
        <Notification
          status='error'
          message={error}
          onClose={() => setError(null)}
        />
      )}
      <div className={classes.tableGrid}>
        <Table
          showHeader={false}
          columns={columns}
          dataSource={data1}
          pagination={false}
          components={components}
          bordered={true}
          rowClassName={() => 'editable-row'}
          size='small'
        />
        <Table
          showHeader={false}
          columns={columns}
          components={components}
          dataSource={data2}
          pagination={false}
          bordered={true}
          rowClassName={() => 'editable-row'}
          size='small'
        />
      </div>
    </Card>
  );
}
