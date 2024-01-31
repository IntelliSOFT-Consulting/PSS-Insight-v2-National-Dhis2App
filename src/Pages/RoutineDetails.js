import React, { useEffect, useState } from "react";
import Card from "../components/Card";
import { getdataEntryDetails, resendDataEntry } from "../api/dataEntry";
import HorizontalTable from "../components/HorizontalTable";
import { createUseStyles } from "react-jss";
import { useParams, useNavigate } from "react-router-dom";
import { displayDetails } from "../utils/helpers";
import ResponseGrid from "../components/ResponsesGrid";
import Loader from "../components/Loader";
import Notification from "../components/Notification";
import { Button, Form } from "antd";
import Resend from "../components/Resend";
import useRedirect from "../hooks/redirect";
import { format } from "date-fns";
import Title from "../components/Title";

const useStyles = createUseStyles({
  header: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "2rem",
  },
  btnSuccess: {
    backgroundColor: "#218838 !important",
    color: "white !important",
    borderColor: "#218838 !important",
  },
  btnPublish: {
    backgroundColor: "#0067b9 !important",
    color: "white !important",
    borderColor: "#0067b9 !important",
  },
  btnCancel: {
    backgroundColor: "#aaaaaa !important",
    color: "white !important",
    borderColor: "#aaaaaa !important",
  },
  cardFooter: {
    margin: 0,
    fontSize: "14px",
    display: "flex",
    justifyContent: ({ isExpired }) => (isExpired ? "flex-start" : "flex-end"),
    width: "100%",
    flexDirection: ({ isExpired }) => (isExpired ? "row-reverse" : "row"),

    "& > button": {
      marginLeft: "10px",
    },
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
  },
  expired: {
    margin: "1.5rem 0",
  },
});

export default function RoutineDetails() {
  const [surveySubmission, setSurveySubmission] = useState(null);
  const [selectedIndicators, setSelectedIndicators] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [form] = Form.useForm();

  const [showResend, setShowResend] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSurveySubmission = async () => {
      setLoading(true);
      try {
        const data = await getdataEntryDetails(id);
        if (data.status === "DRAFT") data.responses = [];
        const populateAnswers = displayDetails(data);
        data.questions = populateAnswers;
        setSurveySubmission(data);
      } catch (error) {
        console.log(error);
        setError("Something went wrong. Please refresh the page and try again.");
      }
      setLoading(false);
    };
    fetchSurveySubmission();
  }, [id]);

  const col1 = [
    { title: "Period", index: "selectedPeriod" },
    {
      title: "Date Filled",
      index: "dataEntryDate",
    },
  ];

  const isExpired = () => {
    if (surveySubmission?.respondentDetails?.expiresAt) {
      const date = surveySubmission?.respondentDetails?.expiresAt;
      const now = new Date();
      const expiry = new Date(date);
      const hasResponded = surveySubmission?.responses?.filter((item) => item.response).length > 0;
      return now > expiry && !hasResponded;
    }
    return false;
  };

  const resendSurvey = async (values = {}) => {
    try {
      const payload = {
        indicators: selectedIndicators,
        comments: values.comments,
        surveyId: id,
      };
      const data = await resendDataEntry(payload, surveySubmission.id);

      setShowResend(false);
      setSuccess("Survey resent successfully!");
      form.resetFields();
    } catch (error) {
      console.log(error);
      setError("Something went wrong. Please refresh the page and try again.");
    }
  };
  const classes = useStyles({
    isExpired: isExpired(),
  });

  useRedirect("/routine", 1000, success);

  const footer = (
    <div className={classes.cardFooter}>
      <Button
        name="Small Primary button"
        onClick={() => {
          navigate(-1);
        }}
        small
        value="default"
        className={classes.btnPublish}
      >
        Back
      </Button>
    </div>
  );

  const submitFooter = (
    <div className={classes.modalFooter}>
      <Button className={classes.btnSuccess} onClick={() => form.submit()}>
        Submit
      </Button>
    </div>
  );

  return (
    <Card title="RESPONSE" footer={surveySubmission || isExpired() ? footer : null}>
      <Resend
        open={showResend}
        onCancel={() => {
          setShowResend(false);
        }}
        onFinish={resendSurvey}
        footer={submitFooter}
        Form={Form}
        form={form}
        id={surveySubmission?.respondentDetails?.id}
        noExpiry={true}
      />
      {error && <Notification message={error} status="error" onClose={() => setError(null)} id="error" />}
      {success && <Notification message={success} status="success" onClose={() => setSuccess(null)} key="success" />}
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className={classes.header}>
            <HorizontalTable
              headers={col1}
              data={{
                selectedPeriod: surveySubmission?.selectedPeriod,
                dataEntryDate: surveySubmission?.dataEntryDate
                  ? format(new Date(surveySubmission?.dataEntryDate), "dd/MM/yyyy")
                  : "-",
              }}
            />
          </div>
          <div>
            {surveySubmission?.questions?.map((question, index) => (
              <div key={`key_${index}`}>
                {question.indicators?.length > 0 && <Title text={question.categoryName} />}
                <div>
                  {question.indicators.map((indicator, index) => (
                    <ResponseGrid
                      selectedIndicators={selectedIndicators}
                      setSelectedIndicators={setSelectedIndicators}
                      key={index}
                      indicator={indicator}
                      referenceSheet={surveySubmission?.referenceSheet}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
