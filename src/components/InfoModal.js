import React from "react";
import Modal from "./Modal";
import { createUseStyles } from "react-jss";
import { PaperClipIcon, InformationCircleIcon } from "@heroicons/react/24/solid";
import Info from "./Info";

const useStyles = createUseStyles({
  infoModal: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  infoLink: {
    display: "flex",
    alignItems: "center",
    padding: "0.5rem",
    marginTop: "1rem",
    backgroundColor: "#CCE0F1",
    width: "max-content",
    "& svg": {
      marginRight: "0.5rem",
      width: "1rem",
      height: "1rem",
    },
  },
});

export default function InfoModal(props) {
  const classes = useStyles();
  return (
    <Modal {...props} type="info">
      <div classname={classes.infoModal}>
        <div>{props.open?.indicatorName}</div>
        <Info
          message={`To find a specific indicator in the reference sheet, use the
                search function (typically Ctrl+F or Command+F) and enter the
                name or keyword of the indicator you're looking for.`}
        />

        <a
          href={`${process.env.REACT_APP_NATIONAL_URL}/api/v1/national-template/view-file/${props.referenceSheet}`}
          className={classes.infoLink}
          target="_blank"
          rel="noreferrer"
        >
          <PaperClipIcon />
          Reference Sheet
        </a>
      </div>
    </Modal>
  );
}
