import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { TabBar, Tab, Button, Pagination } from '@dhis2/ui';
import { createUseStyles } from 'react-jss';
import MiniCard from '../components/MiniCard';
import { format } from 'date-fns';
import { Table, Tooltip } from 'antd';
import {
  getSurveySubmissions,
  listRespondents,
  listSurveys,
} from '../api/surveySubmissions';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import Empty from '../components/Empty';
import { sortSurveys } from '../utils/helpers';
import data from '../Data/Routines.json';
import { listDataEntry } from '../api/dataEntry';

const useStyles = createUseStyles({
  title: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonLink: {
    border: 'none !important',
    background: 'none !important',
    color: '#60B0FF !important',
    cursor: 'pointer',
    textDecoration: 'none',
  },
});

export default function Surveys({ user }) {
  const classes = useStyles();

  const [selected, setSelected] = useState('All');
  const [surveySubmissions, setSurveySubmissions] = useState([]);
  const [allRespondents, setAllRespondents] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const states = [
    {
      name: 'All',
      description:
        'Displays all surveys that have been created and sent regardless of whether or not they have been responded.',
      query: '',
    },
    {
      name: 'Pending',
      description:
        'This tab displays surveys that have been sent to non-routine respondents and are still awaiting to be responded to.',
      query: 'DRAFT',
    },
    {
      name: 'Confirmed',
      description:
        'This tab displays the surveys that have been responded to by the non-routine respondents and have been verified/approved by the national admin.',
      query: 'PUBLISHED',
    },
    {
      name: 'Rejected',
      description:
        'This tab displays the surveys that have been responded to by the non-routine respondents and have not been approved by the national admin due to various reasons such as insufficient information. In this case, the national admin may resend the survey back to the non-routine respondent.',
      query: 'REJECTED',
    },
  ];

  const limit = 20;

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const data = await listDataEntry({ limit });
      setSurveys(data?.details);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const handleChanged = async selected => {
    setLoading(true);
    setSelected(selected.name);
    const data = await listDataEntry({ status: selected?.query || '', limit });
    setSurveys(data?.details);
    setLoading(false);
  };

  const columns = [
    {
      title: 'Respondents',
      dataIndex: 'dataEntryPerson',
      index: 'emailAddress',
      render: (_, col) => {
        const people = col?.dataEntryPerson?.map(
          person => `${person.firstName || '-'} ${person.surname || ''}`
        );
        return people?.join(', ') || '-';
      },
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      index: 'date',
      render: (_, col) => {
        return col.createdAt
          ? format(new Date(col.createdAt), 'dd/MM/yyyy')
          : '-';
      },
    },
    {
      title: 'Actions',
      index: 'actions',
      render: (_, col) => (
        <div>
          <Link className={classes.buttonLink} to={`/routine/${col.id}`}>
            View
          </Link>
        </div>
      ),
    },
  ];

  return (
    <Card title='ROUTINE DATA SUBMISSIONS'>
      <TabBar fixed>
        {states.map(state => (
          <Tab
            key={state.name}
            onClick={() => handleChanged(state)}
            selected={state.name === selected}
          >
            <Tooltip title={state.description} key={state.name}>
              <div className={classes.tab}>{state.name}</div>
            </Tooltip>
          </Tab>
        ))}
      </TabBar>

      <div style={{ padding: 20 }}>
        <Table
          columns={columns}
          dataSource={surveys || []}
          loading={loading}
          locale={{
            emptyText: <Empty message='No submissions found' />,
          }}
          size='small'
          bordered
          pagination={surveys?.length > 15 ? { pageSize: 15 } : false}
        />
      </div>
    </Card>
  );
}
