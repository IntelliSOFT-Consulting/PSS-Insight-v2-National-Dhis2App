import React from "react";
import { createUseStyles } from "react-jss";

import { InformationCircleIcon } from "@heroicons/react/24/solid";

const useStyles = createUseStyles({
  guide: {
    marginTop: "1rem",
    fontSize: "0.8rem",
    backgroundColor: "rgb(239 246 255)",
    borderRadius: "0.375rem",
    padding: "0.5rem",
    "& p": {
      color: "#3B82F6",
      textEmphasis: "italic !important",
      marginTop: "0px !important",
    },
    "& > div": {
      display: "flex",
      "& > div:first-child": {
        flexShrink: 0,
      },
      "& > div:last-child": {
        marginLeft: "0.75rem",
        flex: "1 1 0%",
        display: "block !important",
      },
    },
  },
  infoIcon: {
    width: "1.5rem",
    height: "1.5rem",
    color: "#3B82F6",
  },
});

export default function Info({ message, children }) {
  const classes = useStyles();
  return (
    <div class={classes.guide}>
      <div>
        <div>
          <InformationCircleIcon className={classes.infoIcon} />
        </div>
        <div>
          <p>{message}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
