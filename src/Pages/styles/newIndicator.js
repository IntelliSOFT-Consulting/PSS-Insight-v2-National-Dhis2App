import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  basicDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    position: 'relative',

    columnGap: '2rem',
    '& @media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },

  expression: {
    gridColumn: '1 / 3',
    gridRow: '2 / 3',
    
  },
  definition: {
    gridColumn: '2 / 3',
    gridRow: '3 / 5',
  },
  question: {
    border: '1px solid rgba(2, 102, 185, 0.5)',
    padding: '10px',
    borderRadius: '5px',
    boxShadow: '0 0 5px 0px rgba(2, 102, 185, 0.5)',
    '& input': {
      width: '100%',
    },
    '& .ant-btn-primary': {
      backgroundColor: '#002656',
      padding: '0 2rem !important',
      '&:hover': {
        backgroundColor: '#002F6C !important',
      },
    },
  },
  questionInputs: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: '1rem',
  },
  borderTop: {
    borderTop: '1px solid rgba(0, 0, 0, 0.1)',
    paddingTop: '10px',
  },
  select: {
    width: '20% !important',
    marginLeft: '1rem',
  },
  table: {
    margin: '1rem 0px',
  },
  danger: {
    color: '#F20F0F !important',
  },
  btnSuccess: {
    backgroundColor: '#218838 !important',
    color: 'white',
    border: 'none',
    '&:hover': {
      backgroundColor: '#218838 !important',
      color: 'white !important',
    },
  },
  btnCancel: {
    backgroundColor: '#F2F2F2 !important',
    marginRight: '1rem',
    border: 'none !important',
    '&:hover': {
      backgroundColor: '#F2F2F2 !important',
      outline: 'none !important',
    },
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  formula: {
    backgroundColor: '#F5F9FC',
  },
  selections: {
    margin: '1rem 0px',
    padding: '1rem 0px',
    '& .ant-btn-block': {
      marginTop: '1rem',
    },
  },
  questionsContainer: {
    padding: '10px',
    border: '1px dashed #ccc',
    borderRadius: '5px',
    backgroundColor: '#E0E0E0',
    margin: '10px 0px',
    width: '50%',
    '& >h1': {
      fontSize: '15px',
      fontWeight: 'bold',
      padding: '0px',
      margin: '0px',
    },
    '& .ant-btn-dashed': {
      '&:hover': {
        color: '#0266b9 !important',
        borderColor: '#0266b9 !important',
      },
    },
  },
});

export default useStyles;
