import React, { useState, useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import { Checkbox } from '@dhis2/ui';
import Table from './Table';
import {
  ExclamationCircleIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/solid';
import EditModal from './EditModal';
import InfoModal from './InfoModal';
import { updateIndicator } from '../api/api';
import { formatLatestId, checkDisable } from '../utils/helpers';

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
  centered: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: '500',
  },
});

export default function IndicatorStack({
  indicator,
  disabled,
  formik,
  isView,
  userId,
}) {
  const classes = useStyles();
  const [editModal, setEditModal] = useState(null);
  const [infoModal, setInfoModal] = useState(null);
  const [editIndicator, setEditIndicator] = useState(null);

  const onIndicatorChange = ({ value }) => {
    setEditIndicator({ ...editModal, value });
  };

  const saveIndicator = async () => {
    if (editIndicator) {
      const { value } = editIndicator;
      const { data } = await updateIndicator({
        editValue: value,
        creatorId: userId,
        indicatorId: formatLatestId(editIndicator.indicatorId)?.id,
        categoryId: formatLatestId(editIndicator.categoryId)?.id,
      });
      if (data) {
        const { indicatorDataValue } = indicator;
        const index = indicatorDataValue.findIndex(
          item => item.id === editIndicator.id
        );
        if (index !== -1) {
          indicatorDataValue[index].name = value;
        }
        setEditIndicator(null);
        setEditModal(null);
      }
    }
  };

  const columns = [
    {
      name: 'Version Number',
      key: 'version',
      width: '10rem',
      render: row => (
        <div className={classes.centered}>{indicator.version}</div>
      ),
      rowSpan: indicator.indicatorDataValue.length,
    },
    {
      name: indicator.categoryName || '',
      key: 'code',
      width: '7rem',
    },
    {
      name: (
        <div className={classes.tableFlex}>
          <span>{indicator.indicatorName || ''}</span>
          {!isView && (
            <PencilSquareIcon
              className={classes.edit}
              onClick={() => {
                setEditModal({
                  ...indicator,
                  categoryId: indicator.categoryId,
                  indicatorId: indicator.categoryId,
                });
              }}
            />
          )}
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
          {!isView && (
            <PencilSquareIcon
              className={classes.edit}
              onClick={() =>
                setEditModal({
                  ...row,
                  categoryId: indicator.categoryId,
                  indicatorId: row.id,
                })
              }
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={classes.indicatorStack}>
      <div className={classes.indicatorCheckbox}>
        <Checkbox
          disabled={
            disabled || checkDisable(indicator.categoryId, formik.values)
          }
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
            activeIndicator={indicator.isLatestVersion}
            bordered
          />
        }
      </div>
      <EditModal
        key={editModal?.categoryId || editModal?.id}
        title='EDIT INSTANCE'
        onCancel={() => setEditModal(null)}
        onOk={saveIndicator}
        onChange={onIndicatorChange}
        open={editModal}
        value={
          editIndicator?.value || editModal?.indicatorName || editModal?.name
        }
        type='info'
      />
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
