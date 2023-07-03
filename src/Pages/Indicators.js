import React, { useEffect, useState, useRef } from 'react';
import Card from '../components/Card';
import { Table, Popconfirm, Button, Input, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { createUseStyles } from 'react-jss';
import { Link } from 'react-router-dom';
import { getReferences, deleteReference } from '../api/indicators';
import Highlighter from 'react-highlight-words';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');

  const styles = useStyles();

  const fetchIndicators = async () => {
    setLoading(true);
    try {
      const data = await getReferences();
      setIndicators(data);
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

  const searchInput = useRef(null);
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters, confirm) => {
    clearFilters();
    setSearchText('');
    confirm();
  };

  const getColumnSearchProps = dataIndex => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={e => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type='primary'
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size='small'
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters, confirm)}
            size='small'
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => (
      <SearchOutlined
        style={{
          color: filtered ? '#1890ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: visible => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: text =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });
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
      sorter: (a, b) => new Date(a.indicatorName) - new Date(b.indicatorName),
      sortDirections: ['descend', 'ascend'],
      ...getColumnSearchProps('indicatorName'),
    },
    {
      title: 'CODE',
      dataIndex: 'indicatorCode',
      key: 'indicatorCode',
      width: '30%',
      sorter: (a, b) => new Date(a.indicatorCode) - new Date(b.indicatorCode),
      sortDirections: ['descend', 'ascend'],
      ...getColumnSearchProps('indicatorCode'),
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

  return (
    <Card
      title={
        <div className={styles.header}>
          <h2>INDICATOR DICTIONARY</h2>
          <Link to='/indicators/add'>
            <Button type='primary'>New Indicator</Button>
          </Link>
        </div>
      }
    >
      <Table
        columns={columns}
        loading={loading}
        dataSource={indicators || []}
        rowKey='uuid'
        pagination={
          indicators.length > 15
            ? { pageSize: 15, showSizeChanger: false }
            : false
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
