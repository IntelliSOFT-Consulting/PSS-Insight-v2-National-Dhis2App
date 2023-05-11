import React, { useCallback } from 'react';
import { List } from 'antd';
import { Link } from 'react-router-dom';
import { createUseStyles } from 'react-jss';
import Card from '../components/Card';

const useStyles = createUseStyles({
  list: {
    backgroundColor: '#fff',
    '& .ant-list-item a': {
      color: '#0266B9',
      '&:hover': {
        color: '#0266B9',
      },
    },
  },
});

const createNavLink = (path, label) => <Link to={path}>{label}</Link>;

const links = [
  {
    label: createNavLink('/configurations/contact', 'Contact Configurations'),
    key: 'contact',
  },
  {
    label: createNavLink('/configurations/email', 'Email Configurations'),
    key: 'email',
  },
  {
    label: createNavLink('/configurations/period', 'Period Configurations'),
    key: 'period',
  },
];

export default function Configurations() {
  const classes = useStyles();

  return (
    <Card title='Configurations'>
      <List
        size='large'
        bordered
        dataSource={links}
        renderItem={item => <List.Item key={item.key}>{item.label}</List.Item>}
        className={classes.list}
      />
    </Card>
  );
}
