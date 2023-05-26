import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import { Table, Popconfirm, Button, Input } from 'antd';
import { createUseStyles } from 'react-jss';
import { Link } from 'react-router-dom';
import { getReferences, deleteReference } from '../api/indicators';

const useStyles = createUseStyles({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '0px',
    margin: '0px',
    '& h2': {
      margin: '0px',
      padding: '0px',
      fontSize: '14px',
      fontWeight: 'bold',
    },
    '& button': {
      backgroundColor: '#012F6C',
      color: 'white',
      border: 'none',
    },
  },
  centered: {
    '& th': {
      textAlign: 'center !important',
    },
    '& td': {
      marginLeft: '10px !important',
    },
  },
  actions: {
    padding: '0px !important',
    '& a': {
      '&:not(:last-child)': {
        '&::after': {
          content: '"|"',
          color: '#4B94CE !important',
          padding: '0px 5px !important',
        },
      },
    },
  },
  delete: {
    color: '#F20F0F !important',
    padding: '0px 5px !important',
    margin: '0px !important',
    height: 'auto !important',
  },
  search: {
    width: '50%',
    marginBottom: '10px',
    '@media (max-width: 1020px)': {
      width: '100%',
    },
  },
});

export default function Indicators() {
  const [indicators, setIndicators] = useState([]);
  const [search, setSearch] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const styles = useStyles();

  const fetchIndicators = async () => {
    setLoading(true);
    try {
      const data = await getReferences();
      setIndicators(data);
      setSearch(data);
    } catch (error) {
      setError('Error fetching indicators');
    }
    setLoading(false);
  };

  const handleDelete = async id => {
    try {
      await deleteReference(id);
      fetchIndicators();
    } catch (error) {
      setError('Error deleting indicator');
    }
  };

  useEffect(() => {
    fetchIndicators();
  }, []);

  const columns = [
    {
      title: '#',
      dataIndex: 'uuid',
      key: 'uuid',
      render: (_, _record, index) => index + 1,
      width: '10%',
    },
    {
      title: 'NAME',
      dataIndex: 'indicatorName',
      key: 'indicatorName',
      width: '30%',
    },
    {
      title: 'CODE',
      dataIndex: 'indicatorCode',
      key: 'indicatorCode',
      width: '30%',
    },
    {
      title: 'ACTIONS',
      dataIndex: 'actions',
      key: 'actions',
      render: (_, record) => (
        <div className={styles.actions}>
          <Link to={`/indicators/indicator/${record.uuid}`}>View</Link>
          <Link to={`/indicators/indicator/${record.uuid}/edit`}>Edit</Link>
          <Popconfirm
            title='Are you sure you want to delete this indicator?'
            onConfirm={() => handleDelete(record.uuid)}
            okText='Yes'
            cancelText='No'
          >
            <Button className={styles.delete} type='link'>
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
      width: '30%',
    },
  ];

  const handleSearch = value => {
    // filter by name or code
    const filtered = indicators.filter(
      indicator =>
        indicator.indicatorName.toLowerCase().includes(value.toLowerCase()) ||
        indicator.indicatorCode.toLowerCase().includes(value.toLowerCase())
    );
    setSearch(filtered);
  };

  const handleReset = () => {
    setSearch(indicators);
  };

  return (
    <Card
      title={
        <div className={styles.header}>
          <h2>INDICATOR DICTIONARY</h2>
          <Link to='/indicators/add'>
            <Button type='primary'>Add new</Button>
          </Link>
        </div>
      }
    >
      <Input.Search
        placeholder='Search by name or code'
        onSearch={handleSearch}
        onReset={handleReset}
        allowClear
        className={styles.search}
        size='large'
      />

      <Table
        columns={columns}
        loading={loading}
        dataSource={search || []}
        rowKey='uuid'
        pagination={
          search.length > 15 ? { pageSize: 15, showSizeChanger: false } : false
        }
        className={styles.centered}
        locale={{
          emptyText: 'No indicators found',
        }}
        bordered
        size='small'
      />
    </Card>
  );
}
