import React, { useState, useEffect } from 'react';
import { getVersions, deleteVersion } from '../api/api';
import { createUseStyles } from 'react-jss';
import Card from '../components/Card';
import { format } from 'date-fns';
import { Table, Popconfirm } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import Empty from '../components/Empty';
import { Button } from '@dhis2/ui';
import { toSentenceCase } from '../utils/helpers';

const useStyles = createUseStyles({
  actions: {
    '& button': {
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      textDecoration: 'underline',
      margin: '0 3px',
      padding: 0,
      '&:not(:first-child)': {
        '&:before': {
          content: '"|"',
          margin: '0 3px',
          color: '#005a8e !important',
        },
      },
    },
  },
  edit: {
    color: '#005a8e',
  },
  delete: {
    color: '#f44336',
  },
  title: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default function Versions({ user }) {
  const [versions, setVersions] = useState([]);
  const [deleted, setDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const classes = useStyles();

  const navigate = useNavigate();

  const getVersons = async () => {
    try {
      const data = await getVersions();
      setVersions(data?.details);
      setLoading(false);
    } catch (error) {
      setError(error?.response?.data);
    }
  };

  const handleDelete = async id => {
    try {
      await deleteVersion(id);
      setDeleted(true);
    } catch (error) {
      setError(error?.response?.data);
    }
  };

  useEffect(() => {
    getVersons();
  }, [deleted]);

  const columns = [
    {
      title: '#',
      dataIndex: 'id',
      render: (_, _row, index) => index + 1,
    },
    {
      title: 'DATE CREATED',
      dataIndex: 'createdAt',
      render: (_, row) =>
        row.createdAt && format(new Date(row.createdAt), 'dd/MM/yyyy'),
    },
    {
      title: 'CREATED BY',
      dataIndex: 'createdBy',
    },
    {
      title: 'VERSION NUMBER',
      dataIndex: 'versionName',
    },
    {
      title: 'DESCRIPTION',
      dataIndex: 'versionDescription',
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      render: (_, row) => row.status && toSentenceCase(row.status),
    },
    {
      title: 'PUBLISHED BY',
      dataIndex: 'publishedBy',
    },
    {
      title: 'ACTIONS',
      dataIndex: 'actions',
      render(_, row) {
        return (
          <div className={classes.actions}>
            <button
              onClick={() => {
                localStorage.setItem('currentIndicator', JSON.stringify(row));
                navigate(`/templates/view/${row?.id}`);
              }}
              className={classes.edit}
            >
              View
            </button>
            {row?.status !== 'PUBLISHED' &&
              row?.createdBy === user?.me?.username && (
                <button
                  className={classes.edit}
                  onClick={() => {
                    localStorage.setItem(
                      'currentIndicator',
                      JSON.stringify(row)
                    );
                    navigate(`/templates/edit/${row?.id}`);
                  }}
                >
                  Edit
                </button>
              )}
            {row?.status !== 'PUBLISHED' && (
              <Popconfirm
                title='Are you sure you want to delete this version?'
                onConfirm={() => handleDelete(row?.id)}
              >
                <button className={classes.delete}>Delete</button>
              </Popconfirm>
            )}
          </div>
        );
      },
    },
  ];

  const title = (
    <div className={classes.title}>
      <h3>TEMPLATES</h3>
      <Link to='/templates/versions/new'>
        <Button primary>New Version</Button>
      </Link>
    </div>
  );

  return (
    <Card title={title}>
      {versions?.length === 0 && !loading ? (
        <Empty />
      ) : (
        <Table
          columns={columns}
          dataSource={versions || []}
          loading={loading}
          rowKey='id'
          size='small'
          pagination={versions?.length > 10 ? { pageSize: 10 } : false}
          locale={{ emptyText: <Empty /> }}
        />
      )}
    </Card>
  );
}
