import React from 'react';
import Modal from './Modal';
import { createUseStyles } from 'react-jss';
import { PaperClipIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';

const useStyles = createUseStyles({
  infoModal: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  infoLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem',
    marginTop: '1rem',
    backgroundColor: '#CCE0F1',
    width: 'max-content',
    '& svg': {
      marginRight: '0.5rem',
      width: '1rem',
      height: '1rem',
    },
  },
});

export default function InfoModal(props) {
  const classes = useStyles();
  return (
    <Modal {...props} type='info'>
      <div classname={classes.infoModal}>
        <div>{props.open?.indicatorName}</div>
        <Link to='/#' className={classes.infoLink}>
          <PaperClipIcon />
          Reference Sheet
        </Link>
      </div>
    </Modal>
  );
}
