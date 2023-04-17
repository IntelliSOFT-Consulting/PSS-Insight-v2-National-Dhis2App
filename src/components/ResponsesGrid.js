import React, { useState } from 'react';
import { createUseStyles } from 'react-jss';
import Table from './Table';
import { Checkbox } from '@dhis2/ui';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';
import InfoModal from './InfoModal';
import FormInput from './FormDef';

const useStyles = createUseStyles({
  indicatorStack: {
    display: 'flex',
    margin: '10px 0',
    border: '1px solid #e0e0e0',
  },
  indicatorCheckbox: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorTable: {
    width: '100%',
  },

  tableFlex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: '3rem',
    position: 'relative',
    width: '100%',
  },
  info: {
    position: 'absolute !important',
    right: '0',
    cursor: 'pointer',
    width: '1.5rem',
    height: '1.5rem',
    color: '#0067B9',
  },
});

export default function ResponseGrid({
  indicator,
  formik,
  isView,
  fileNames,
  setFileNames,
}) {
  const classes = useStyles();
  const [infoModal, setInfoModal] = useState(null);
  const [error, setError] = useState(null);

  const columns = [
    {
      name: indicator.categoryName || '',
      key: 'code',
      width: '7rem',
    },
    {
      name: (
        <div className={classes.tableFlex}>
          <span>{indicator.indicatorName || ''}</span>
          <ExclamationCircleIcon
            className={classes.info}
            onClick={() => setInfoModal(indicator)}
          />
        </div>
      ),
      headerSpan: 4,
      key: 'indicatorName',
      render: row => (
        <div className={classes.tableFlex}>
          <span>{row.name}</span>
        </div>
      ),
      width: '50% !important',
    },
    {
      name: '',
      key: 'response',
      render: row =>
        row?.response === 'true'
          ? 'Yes'
          : row?.response === 'false'
          ? 'No'
          : row?.response,
      width: '20rem',
      hidden: true,
    },
    {
      name: '',
      key: 'comment',
      width: '20rem',
      hidden: true,
    },
    {
      name: '',
      render: row => (
        <a href={row?.attachment} target='_blank' rel='noreferrer'>
          {row?.attachment ? 'View attachment' : '-'}
        </a>
      ),
      width: '10rem',
      hidden: true,
    },
  ];

  return (
    <div className={classes.indicatorStack}>
      <div className={classes.indicatorCheckbox}>
        <Checkbox
          // disabled={
          //   disabled || checkDisable(indicator.categoryId, formik.values)
          // }
          // checked={Object.values(formik.values)?.includes(indicator.categoryId)}
          // onChange={({ checked }) => {
          //   if (checked) {
          //     formik.setFieldValue(indicator.categoryId, indicator.categoryId);
          //   } else {
          //     formik.setFieldValue(indicator.categoryId, '');
          //   }
          // }}
        />
      </div>
      <div className={classes.indicatorTable}>
        {
          <Table
            columns={columns}
            tableData={indicator.indicatorDataValue}
            activeIndicator={false}
            bordered
          />
        }
      </div>

      <InfoModal
        key={infoModal?.categoryId}
        title={`${infoModal?.code || ''} DEFINITION`}
        onCancel={() => setInfoModal(null)}
        open={infoModal}
        type='info'
        footer={null}
      />
    </div>
  );
}
