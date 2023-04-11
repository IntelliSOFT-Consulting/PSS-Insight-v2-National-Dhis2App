import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { TabBar, Tab, Button, Pagination } from '@dhis2/ui';
import { createUseStyles } from 'react-jss';
import MiniCard from '../components/MiniCard';
import { format } from 'date-fns';
import Table from '../components/Table';
import {
  getSurveySubmissions,
  listRespondents,
  listSurveys,
} from '../api/surveySubmissions';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import Empty from '../components/Empty';
import { sortSurveys } from '../utils/helpers';

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

  const states = [
    'All',
    'Draft',
    'Pending',
    'Verified',
    'Cancelled',
    'Expired',
  ];

  const limit = 10;

  const fetchSurveySubmissions = async () => {
    setLoading(true);
    try {
      const { data } = await getSurveySubmissions(selected, limit, currentPage);
      setSurveySubmissions(data?.details);
      setTotalCount(data?.count);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const data = await listSurveys(user?.me?.id);
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

  useEffect(() => {}, [selected, currentPage]);

  const handleChanged = async selected => {
    const data = await listSurveys(
      user?.me?.id,
      selected?.toUpperCase() || 'ALL'
    );
    setSurveys(data?.details);
    setSelected(selected);
  };

  const title = (
    <div className={classes.title}>
      <h5 style={{ margin: 0 }}>SURVEY SUBMISSIONS</h5>
      <Link to='/surveys/create'>
        <Button primary>Create survey</Button>
      </Link>
    </div>
  );

  const columns = [
    {
      name: 'Respondents',
      index: 'emailAddress',
      render: col => col.emailAddress,
    },
    {
      name: 'Date',
      index: 'date',
      render: col =>
        col.createdAt ? format(new Date(col.createdAt), 'dd/MM/yyyy') : '-',
    },
    {
      name: 'Actions',
      render: col => (
        <div>
          <Link
            className={classes.buttonLink}
            to={`/surveys/response/${col.respondentId}`}
          >
            View
          </Link>
        </div>
      ),
    },
  ];

  const draftColumns = [
    {
      name: 'Survey Name',
      index: 'surveyName',
      render: col => col.surveyName,
    },
    {
      name: 'Description',
      index: 'surveyDescription',
      render: col => col.surveyDescription,
    },
    {
      name: 'Actions',
      render: col => (
        <div>
          <Link
            className={classes.buttonLink}
            to={`/surveys/edit/${col.surveyId}`}
          >
            Edit
          </Link>
        </div>
      ),
    },
  ];

  const handlePageChange = page => {
    setCurrentPage(page);
  };

  console.log(sortSurveys(surveys));

  return (
    <Card title={title}>
      <TabBar fixed>
        {states.map(state => (
          <Tab
            key={state}
            onClick={() => handleChanged(state)}
            selected={state === selected}
          >
            {state}
          </Tab>
        ))}
      </TabBar>
      <div style={{ padding: 20 }}>
        {loading && <Loader />}
        {surveys?.length === 0 && <Empty message='No surveys' />}
        {selected === 'Draft' ? (
          <Table
            columns={draftColumns}
            tableData={surveys}
            loading={loading}
            bordered
          />
        ) : (
          sortSurveys(surveys)?.map(survey => (
            <MiniCard title={survey.surveyName} key={survey.surveyId}>
              <Table
                columns={columns}
                tableData={survey.respondentList}
                loading={loading}
                bordered
              />
            </MiniCard>
          ))
        )}
      </div>

      {/* <Pagination
        currentPage={currentPage}
        onChange={page => setCurrentPage(page)}
        pageSize={limit}
        pageCount={Math.ceil(totalCount / limit)}
        total={totalCount}
        hidePageSelect
        hidePageSizeSelect
        hidePageSummary
      /> */}
    </Card>
  );
}
