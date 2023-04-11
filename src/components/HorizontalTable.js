import React, { Fragment } from 'react';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  table: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    fontSize: '14px',
    '& > *': {
      padding: '0.5rem',
      border: '1px solid rgba(0, 0, 0, 0.08)',
    },
  },
});

export default function HorizontalTable({ headers, data }) {
  const classes = useStyles();
  return (
    <div className={classes.table}>
      {headers.map((header, index) => (
        <Fragment key={index}>
          <div style={{ fontWeight: '300' }}>{header.title}</div>
          <div style={{ fontWeight: '400' }}>{data[header.index]}</div>
        </Fragment>
      ))}
    </div>
  );
}
