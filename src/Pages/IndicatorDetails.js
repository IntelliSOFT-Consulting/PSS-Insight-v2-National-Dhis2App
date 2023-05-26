import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import { createUseStyles } from 'react-jss';
import { Button, Table } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { getReferenceDetails } from '../api/indicators';

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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridGap: '2rem',
    margin: '2rem 0',
    '& @media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
    '& .ant-table-container': {
      borderRadius: '0px !important',
    },
  },
  table: {
    '& .ant-table-container, table, thead, th': {
      borderRadius: '0px !important',
      borderStartStartRadius: '0px !important',
      borderStartEndRadius: '0px !important',
    },

    '& thead': {
      '& th': {
        background: '#E3EEF7 !important',
      },
    },
  },
});

export default function () {
  const [indicator, setIndicator] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const styles = useStyles();

  const { id } = useParams();

  const fetchIndicator = async () => {
    setLoading(true);
    try {
      const response = await getReferenceDetails(id);
      setIndicator(response);
    } catch (error) {
      setError('Error fetching indicator details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndicator();
  }, []);

  const columns = [
    {
      title: '',
      dataIndex: 'name',
      key: 'name',
      render: text => `${text}:`,
      width: '40%',
    },
    {
      title: '',
      dataIndex: 'value',
      key: 'value',
    },
  ];

  const questionColumn = [
    {
      title: 'QUESTIONS',
      dataIndex: 'name',
      key: 'name',
    },
  ];

  const data1 = [
    { name: 'Indicator Name', value: indicator?.indicatorName },
    {
      name: 'PSS Insight Indicator #',
      value: indicator?.indicatorCode,
    },
    {
      name: 'Data Type',
      value: indicator?.dataType,
    },
  ];

  const data2 = [
    {
      name: 'Topic',
      value: indicator?.topic,
    },
    {
      name: 'Definition',
      value: indicator?.definition,
    },
  ];

  const data3 = [
    {
      name: 'Purpose and Issues',
      value: indicator?.purposeAndIssues,
    },
    {
      name: 'Method of Estimation',
      value: indicator?.methodOfEstimation,
    },
    {
      name: 'Expected Frequency of Data Dissemination',
      value: indicator?.expectedFrequencyOfDataDissemination,
    },
    {
      name: 'Data Type',
      value: indicator?.dataType,
    },
  ];

  const data4 = [
    {
      name: 'Preferred Data Sources',
      value: indicator?.preferredDataSources,
    },
    {
      name: 'Proposed Scoring or Benchmarking',
      value: indicator?.proposedScoring,
    },
    {
      name: 'Indicator Source(s)',
      value: indicator?.indicatorSource,
    },
  ];

  return (
    <Card
      title={
        <div className={styles.header}>
          <h2>INDICATOR {indicator?.indicatorCode}</h2>
          <Button type='primary'>
            <Link to='/indicators/dictionary'>Back</Link>
          </Button>
        </div>
      }
    >
      <div className={styles.grid}>
        <Table
          columns={columns}
          dataSource={data1}
          pagination={false}
          loading={loading}
          showHeader={false}
          bordered
        />
        <Table
          columns={columns}
          dataSource={data2}
          pagination={false}
          loading={loading}
          showHeader={false}
          bordered
        />
      </div>
      <div className={styles.table}>
        <Table
          columns={questionColumn}
          dataSource={indicator?.assessmentQuestions || []}
          pagination={false}
          loading={loading}
          bordered
          locale={{
            emptyText: 'No questions',
          }}
        />
      </div>
      <div className={styles.grid}>
        <Table
          columns={columns}
          dataSource={data3}
          pagination={false}
          loading={loading}
          showHeader={false}
          bordered
        />
        <Table
          columns={columns}
          dataSource={data4}
          pagination={false}
          loading={loading}
          showHeader={false}
          bordered
        />
      </div>
    </Card>
  );
}
