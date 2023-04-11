import React from 'react';
import { Card } from '@dhis2/ui';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  card: {
    margin: '10px 0',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    width: '100%',
    borderRadius: '0px',
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: '400',
    margin: '0 0 10px 0',
    backgroundColor: '#EFF5F9',
    padding: '10px 20px',
  },
});

export default function MiniCard({ title, children, footer }) {
  const classnames = useStyles();
  return (
    <Card className={classnames.card}>
      <h5 className={classnames.cardTitle}>{title}</h5>
      <div
        style={{
          padding: 15,
        }}
      >
        {children}
      </div>
      {footer}
    </Card>
  );
}
