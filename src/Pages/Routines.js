import React, { useState, useEffect } from "react";
import Card from "../components/Card";
import { createUseStyles } from "react-jss";
import { format } from "date-fns";
import { Table } from "antd";
import { Link } from "react-router-dom";
import Empty from "../components/Empty";
import { listDataEntry } from "../api/dataEntry";

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

export default function Surveys() {
  const classes = useStyles();

  const [surveys, setSurveys] = useState([]);
  // const [totalCount, setTotalCount] = useState(0);
  // const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [_error, setError] = useState(null);

  const limit = 20;

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const data = await listDataEntry({ count: limit });
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

  const columns = [
    {
      title: "Respondents",
      dataIndex: "dataEntryPerson",
      index: "emailAddress",
      render: (_, col) => {
        const people = col?.dataEntryPerson?.map((person) => `${person.firstName || "-"} ${person.surname || ""}`);
        return people?.join(", ") || "-";
      },
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      index: "date",
      render: (_, col) => {
        return col.createdAt ? format(new Date(col.createdAt), "dd/MM/yyyy") : "-";
      },
    },
    {
      title: "Actions",
      index: "actions",
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
    <Card title="ROUTINE DATA SUBMISSIONS">
      <div style={{ padding: 20 }}>
        <Table
          columns={columns}
          dataSource={surveys || []}
          loading={loading}
          locale={{
            emptyText: <Empty message="No submissions found" />,
          }}
          size="small"
          bordered
          pagination={surveys?.length > 15 ? { pageSize: 15 } : false}
        />
      </div>
    </Card>
  );
}
