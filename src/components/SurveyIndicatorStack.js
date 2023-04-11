import React, { useState, useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import { Checkbox } from '@dhis2/ui';
import Table from './Table';
import {
  ExclamationCircleIcon,
} from '@heroicons/react/24/solid';
import InfoModal from './InfoModal';

const useStyles = createUseStyles({
  indicatorStack: {
    display: 'grid',
    gridTemplateColumns: '4rem auto',
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
  edit: {
    position: 'absolute',
    right: '2rem',
    cursor: 'pointer',
    width: '1rem',
    height: '1rem',
    color: '#0067B9',
  },
  info: {
    position: 'absolute',
    right: '0',
    cursor: 'pointer',
    width: '1.5rem',
    height: '1.5rem',
    color: '#0067B9',
  },
});

export default function IndicatorStack({
  indicator,
  disabled,
  formik,
  isView,
}) {
  const classes = useStyles();
  const [infoModal, setInfoModal] = useState(null);


  const columns = [
    {
      name: indicator.code || '',
      key: 'code',
      width: '7rem',
    },
    {
      name: (
        <div className={classes.tableFlex}>
          <span>{indicator.categoryName || ''}</span>
          <ExclamationCircleIcon
            className={classes.info}
            onClick={() => setInfoModal(indicator)}
          />
        </div>
      ),
      key: 'name',
      render: row => (
        <div className={classes.tableFlex}>
          <span>{row.name}</span>
        </div>
      ),
    },
  ];

  return (
    <div className={classes.indicatorStack}>
      <div className={classes.indicatorCheckbox}>
        <Checkbox
          disabled={disabled}
          checked={Object.values(formik.values)?.includes(indicator.categoryId)}
          onChange={({ checked }) => {
            if (checked) {
              formik.setFieldValue(indicator.categoryId, indicator.categoryId);
            } else {
              formik.setFieldValue(indicator.categoryId, '');
            }
          }}
        />
      </div>
      <div className={classes.indicatorTable}>
        {
          <Table
            columns={columns}
            tableData={indicator.indicatorDataValue}
            activeIndicator={true}
            bordered
          />
        }
      </div>
      <InfoModal
        key={infoModal?.categoryId}
        title={`${infoModal?.categoryName || ''} DEFINITION`}
        onCancel={() => setInfoModal(null)}
        open={infoModal}
        type='info'
        footer={null}
      />
    </div>
  );
}
