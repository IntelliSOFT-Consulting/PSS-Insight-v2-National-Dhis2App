import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { TabBar, Tab, Button, Pagination } from '@dhis2/ui';
import { createUseStyles } from 'react-jss';
import MiniCard from '../components/MiniCard';
import { format } from 'date-fns';
import Table from '../components/Table';
import { getSurveySubmissions, listSurveys } from '../api/surveySubmissions';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import Empty from '../components/Empty';
import { sortSurveys } from '../utils/helpers';
import { Tooltip } from 'antd';

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
  tab: {
    width: '100%',
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
    {
      name: 'All',
      description:
        'Displays all surveys that have been created and sent regardless of whether or not they have been responded.',
      query: 'ALL',
    },
    {
      name: 'Draft',
      description:
        'These are the submissions that have been created but have not been published.',
      query: 'DRAFT',
    },
    {
      name: 'Pending',
      description:
        'This tab displays surveys that have been sent to non-routine respondents and are still awaiting to be responded to.',
      query: 'PENDING',
    },
    {
      name: 'Confirmed',
      description:
        'This tab displays the surveys that have been responded to by the non-routine respondents and have been verified/approved by the national admin.',
      query: 'VERIFIED',
    },
    {
      name: 'Rejected',
      description: `This tab displays the surveys that have been responded to by the non-routine respondents and have not been approved by the national admin due to various reasons such as insufficient information. In this case, the national admin may resend the survey back to the non-routine respondent.`,
      query: 'REJECTED',
    },
    {
      name: 'Expired',
      description: `This tab displays the surveys sent by the national admin to the non-routine respondents and the link was invalid since the respondent did not access the survey in good time. It also displays whether or not the respondent has requested a new link to the survey.`,
      query: 'EXPIRED',
    },
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
      const filteredSurveys = selected === 'Draft' ? data?.details : data?.details?.filter(
        survey => survey?.respondentList?.length > 0
      );
      setSurveys(filteredSurveys);
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
    const data = await listSurveys(user?.me?.id, selected?.query || 'ALL');
    const filteredSurveys = selected.name === 'Draft' ? data?.details : data?.details?.filter(
      survey => survey?.respondentList?.length > 0
    );
    setSurveys(filteredSurveys);
    setSelected(selected.name);
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

  const expiredCols = [
    {
      name: 'Respondents',
      index: 'emailAddress',
      render: col => col.emailAddress,
    },
    {
      name: 'Date Expired',
      index: 'date',
      render: col =>
        col.expiryDate ? format(new Date(col.expiryDate), 'dd/MM/yyyy') : '-',
    },
    {
      name: 'New Link Requested',
      index: 'newLinkRequested',
      render: col => (col.newLinkRequested ? 'Yes' : 'No'),
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

  return (
    <Card title={title}>
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
        {loading && <Loader />}
        {surveys?.length === 0 && <Empty message='No surveys' />}
        {selected === 'Draft' ? (
          <>
            {surveys?.length > 0 && (
              <Table
                columns={draftColumns}
                tableData={surveys}
                loading={loading}
                bordered
              />
            )}
          </>
        ) : (
          sortSurveys(surveys)?.map(survey => (
            <MiniCard title={survey.surveyName} key={survey.surveyId}>
              <Table
                columns={selected === 'Expired' ? expiredCols : columns}
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
