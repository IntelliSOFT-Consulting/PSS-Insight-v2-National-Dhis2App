import React from 'react';
import { List } from 'antd';
import { Link } from 'react-router-dom';
import { createUseStyles } from 'react-jss';
import CardItem from '../components/Card';

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

export default function Configurations() {
  const classes = useStyles();
  const links = [
    {
      label: <Link to='/configurations/contact'>Contact Configurations</Link>,
      key: 'contact',
    },
    {
      label: <Link to='/configurations/email'>Email Configurations</Link>,
      key: 'email',
    },
    {
      label: <Link to='/configurations/period'>Period Configurations</Link>,
      key: 'period',
    },
  ];
  return (
    <CardItem title='Configurations'>
      <List
        size='large'
        bordered
        dataSource={links}
        renderItem={item => <List.Item>{item?.label}</List.Item>}
        className={classes.list}
      />
    </CardItem>
  );
}
