import React from 'react';
import { Card } from '@dhis2/ui';
import classnames from '../App.module.css';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  footer: {
    backgroundColor: '#F0F5F8',
    padding: '10px 1rem',
    marginTop: '1rem',
  },
});

export default function CardItem({ title, footer, children }) {
  const classes = useStyles();
  return (
    <Card className={classnames.card}>
      <h5 className={classnames.cardTitle}>{title}</h5>
      <div
        style={{
          padding: 20,
        }}
      >
        {children}
      </div>

      {footer && <div className={classes.footer}>{footer}</div>}
    </Card>
  );
}
