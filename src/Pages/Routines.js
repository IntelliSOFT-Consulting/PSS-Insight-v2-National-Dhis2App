import React, { useState, useEffect } from "react";
import Card from "../components/Card";
import { TabBar, Tab, Button, Pagination } from "@dhis2/ui";
import { createUseStyles } from "react-jss";
import MiniCard from "../components/MiniCard";
import { format } from "date-fns";
import { Table } from "antd";
import {
  getSurveySubmissions,
  listRespondents,
  listSurveys,
} from "../api/surveySubmissions";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import Empty from "../components/Empty";
import { sortSurveys } from "../utils/helpers";
import data from "../Data/Routines.json";

const useStyles = createUseStyles({
  title: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonLink: {
    border: "none !important",
    background: "none !important",
    color: "#60B0FF !important",
    cursor: "pointer",
    textDecoration: "none",
  },
});

export default function Surveys({ user }) {
  const classes = useStyles();

  const [selected, setSelected] = useState("All");
  const [surveySubmissions, setSurveySubmissions] = useState([]);
  const [allRespondents, setAllRespondents] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const states = [
    "All",
    "Pending",
    "Pending Revision",
    "Rejected",
    "Published",
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

  const handleChanged = async (selected) => {
    const data = await listSurveys(
      user?.me?.id,
      selected?.toUpperCase() || "ALL"
    );
    setSurveys(data?.details);
    setSelected(selected);
  };

  const title = (
    <div className={classes.title}>
      <h5 style={{ margin: 0 }}>ROUTINE DATA SUBMISSIONS</h5>
      <Link to="#">
        <Button primary></Button>
      </Link>
    </div>
  );

  const columns = [
    {
      title: "Respondents",
      dataIndex: "dataEntryPerson",
      index: "emailAddress",
        render: (_, col) => `${col?.dataEntryPerson?.firstName} ${col?.dataEntryPerson?.surname}`
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      index: "date",
        render: (_, col) =>{
            console.log(col.createdAt);
          return col.createdAt ? format(new Date(col.createdAt), 'dd/MM/yyyy') : '-';
        }
    },
    {
      title: "Actions",
      index: "actions",
      render: (_,col) => (
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
        {states.map((state) => (
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

        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          locale={{
            emptyText: <Empty />,
          }}
          bordered
        />
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
