import React from 'react';
import { createUseStyles } from 'react-jss';
import Card from './Card';
import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const useStyles = createUseStyles({
  main: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: 'fit-content',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
    '& svg': {
      color: '#f59e0b',
      width: '8rem',
    },
    '& p': {
      fontSize: '14px',
      fontWeight: '300',
    },
    '& a': {
      color: '#005a8e',
      textDecoration: 'underline',
    },
  },
});

export default function Empty({ message }) {
  const classes = useStyles();
  return (
    <div className={classes.main}>
      <ExclamationTriangleIcon
        className='h-5 w-5 text-yellow-400'
        aria-hidden='true'
      />
      {message || (
        <p>
          No template has been created yet please navigate to{' '}
          <Link to='/templates/versions/new'>Add a New Version</Link> page
        </p>
      )}
    </div>
  );
}
