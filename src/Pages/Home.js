import React from 'react';
import Card from '../components/Card';
import { Link } from 'react-router-dom';
import { createUseStyles } from 'react-jss';
import { routes } from '../utils/quickLinks';

const useStyles = createUseStyles({
  main: {
    display: 'flex',
    width: '100%',
    height: 'fit-content',
    maxWidth: '80rem',
    margin: '3rem auto',
  },
  mainRoutes: {
    display: 'grid !important',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gridGap: '1rem',
    width: '100% !important',
    height: ' 100%',
    padding: '2rem',
    '& a': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '3rem 1rem',
      margin: '1rem 0px',
      textAlign: 'center',
      textDecoration: 'none',
      boxShadow: '0 0 0 1px rgba(0, 103, 185, 0.3)',
      borderRadius: ' 0.25rem',
      color: '#005a8e',
      width: '100%',
      '&:hover': {
        backgroundColor: '#005a8e0f',
      },
    },
    '@media (max-width: 768px)': {
      gridTemplateColumns: 'repeat(2, 1fr) !important',
    },
  },
});

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
