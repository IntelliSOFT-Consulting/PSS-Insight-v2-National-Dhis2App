import React from 'react';
import { Card } from '@dhis2/ui';
import classnames from '../App.module.css';

export default function CardItem({ title, footer, children }) {
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
      {footer}
    </Card>
  );
}
