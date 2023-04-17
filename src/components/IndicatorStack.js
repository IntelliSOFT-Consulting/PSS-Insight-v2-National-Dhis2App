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
import ModalItem from './Modal';
import { Input } from 'antd';

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
  updateIndicators,
}) {
  const classes = useStyles();
  const [infoModal, setInfoModal] = useState(null);
  const [editedDescription, setEditedDescription] = useState('');
  const [error, setError] = useState(null);

  const [editingKey, setEditingKey] = useState('');

  const editRow = record => {
    setEditingKey(record.categoryId || record.id);
    setEditedDescription(record.indicatorName || record.name);
  };

  const saveRow = async key => {
    try {
      const payload = {
        editValue: editedDescription,
        creatorId: userId,
      };
      if (indicator.categoryId === key) {
        const id = formatLatestId(key)?.id;
        payload.indicatorId = id;
        payload.categoryId = id;
      } else {
        payload.indicatorId = formatLatestId(key)?.id;
        payload.categoryId = formatLatestId(indicator.categoryId)?.id;
      }
      const data = await updateIndicator(payload);
      if (data) {
        await updateIndicators(key, editedDescription);
        setEditingKey('');
      }
    } catch (e) {
      setError('Error updating indicator');
    }
  };

  const cancelRow = () => {
    setEditingKey('');
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
              onClick={() =>
                editRow({
                  categoryId: indicator?.categoryId,
                  indicatorName: indicator?.indicatorName,
                })
              }
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
              onClick={() => editRow(row)}
            />
          )}
        </div>
      ),
    },
  ];

  const handleDescriptionChange = e => {
    setEditedDescription(e.target.value);
  };

  const handleModalOk = () => {
    saveRow(editingKey);
    setEditedDescription('');
  };

  const handleModalCancel = () => {
    cancelRow();
    setEditedDescription('');
  };

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
      <ModalItem
        title='EDIT INSTANCE'
        open={!!editingKey}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        type='info'
      >
        <Input.TextArea
          value={editedDescription}
          onChange={handleDescriptionChange}
          placeholder='Description'
          rows={4}
        />
      </ModalItem>
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
