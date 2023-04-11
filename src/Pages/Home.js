import React from 'react';
import Card from '../components/Card';
import { Link } from 'react-router-dom';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  main: {
    display: 'flex',
    width: '100%',
    height: 'fit-content',
    maxWidth: '80rem',
    margin: '3rem auto',
  },
  mainRoutes: {
    display: 'flex !important',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100% !important',
    height: ' 100%',
    padding: '2rem',
    '& a': {
      flex: '1 1 minmax(100px, 1fr)',
      height: '100%',
      padding: '3rem 1rem',
      margin: '1rem',
      textAlign: 'center',
      textDecoration: 'none',
      boxShadow: '0 0 0 1px rgba(0, 103, 185, 0.3)',
      borderRadius: ' 0.25rem',
      color: '#005a8e',
      width: 'calc(33% - 3rem)',
      '&:hover': {
        backgroundColor: '#005a8e0f',
      },
    },
  },
});
const routes = [
  {
    path: '/templates/versions',
    text: 'Local Master Indicator Template',
  },
  {
    path: '/surveys/menu',
    text: 'Surveys',
  },
];

export default function Home() {
  const classes = useStyles();
  return (
    <div className={classes.main}>
      <Card title='Quick Links' className={classes.mainRoutes}>
        <div className={classes.mainRoutes}>
          {routes.map(route => (
            <Link to={route.path} key={route.path}>
              {route.text}
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
