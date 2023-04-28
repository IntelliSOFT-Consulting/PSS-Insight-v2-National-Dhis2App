import React, { useState, useEffect } from 'react';
import { getVersions, deleteVersion } from '../api/api';
import { createUseStyles } from 'react-jss';
import Card from '../components/Card';
import { format } from 'date-fns';
import Table from '../components/Table';
import { Popconfirm } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import Empty from '../components/Empty';
import Loader from '../components/Loader';
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
    },
  },
  edit: {
    color: '#005a8e',
  },
  delete: {
    color: '#f44336',
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
      name: '#',
      key: 'id',
      render: (row, index) => index + 1,
    },
    {
      name: 'DATE CREATED',
      key: 'createdAt',
      render: row =>
        row.createdAt && format(new Date(row.createdAt), 'dd/MM/yyyy'),
    },
    {
      name: 'CREATED BY',
      key: 'createdBy',
    },
    {
      name: 'VERSION NUMBER',
      key: 'versionName',
    },
    {
      name: 'DESCRIPTION',
      key: 'versionDescription',
    },
    {
      name: 'STATUS',
      key: 'status',
      render: row => row.status && toSentenceCase(row.status),
    },
    {
      name: 'PUBLISHED BY',
      key: 'publishedBy',
    },
    {
      name: 'ACTIONS',
      key: 'actions',
      render(row) {
        return (
          <div className={classes.actions}>
            <button
              onClick={() => {
                localStorage.setItem('currentIndicator', JSON.stringify(row));
                navigate(`/templates/view/${row.id}`);
              }}
              className={classes.edit}
            >
              View
            </button>{' '}
            |{' '}
            {row?.status !== 'PUBLISHED' &&
            row.createdBy === user?.me?.username ? (
              <>
                <button
                  className={classes.edit}
                  onClick={() => {
                    localStorage.setItem(
                      'currentIndicator',
                      JSON.stringify(row)
                    );
                    navigate(`/templates/edit/${row.id}`);
                  }}
                >
                  Edit
                </button>{' '}
                |{' '}
              </>
            ) : null}
            <Popconfirm
              title='Are you sure you want to delete this version?'
              onConfirm={() => handleDelete(row.id)}
            >
              <button className={classes.delete}>Delete</button>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <Card title='TEMPLATES'>
      {versions?.length === 0 && !loading ? (
        <Empty />
      ) : (
        <Table
          columns={columns}
          tableData={versions}
          loading={loading}
          pageSize={15}
          emptyMessage=''
          total={versions?.length}
          pagination={versions?.length > 15}
          hidePageSizeSelect
          hidePageSummary
          hidePageSelect
          bordered
        />
      )}
    </Card>
  );
}
