import React, { useState, useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import { Checkbox } from '@dhis2/ui';
import Table from './Table';
import {
  ExclamationCircleIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/solid';
import InfoModal from './InfoModal';
import { updateIndicator } from '../api/api';
import { formatLatestId, checkDisable } from '../utils/helpers';
import ModalItem from './Modal';
import { Input } from 'antd';
import { useDataEngine } from '@dhis2/app-runtime';

const useStyles = createUseStyles({
  indicatorStack: {
    display: 'grid',
    gridTemplateColumns: '4rem auto 8rem',
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
    cursor: 'pointer',
    width: '1rem',
    height: '1rem',
    color: '#0067B9',
  },
  info: {
    cursor: 'pointer',
    width: '1.5rem',
    height: '1.5rem',
    color: '#0067B9',
    position: 'absolute',
    right: '5px',
    top: '1rem',
  },
  centered: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: '500',
  },
  benchmark: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: '500',
    position: 'relative',

    '& div': {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontWeight: '500',
      padding: '1rem 0',
    },
    '& h4': {
      textAlign: 'center',
      margin: '0',
      padding: '0',
      paddingRight: '2rem',
    },
    '& input': {
      width: '100%',
      maxWidth: '7rem',
      textAlign: 'center',
    },
  },
  latest: {
    background: 'rgb(217, 232, 245)',
  },
  old: {
    background: 'rgb(243, 245, 247)',
  },
});

export default function IndicatorStack({
  indicator,
  disabled,
  formik,
  isView,
  userId,
  updateIndicators,
  referenceSheet,
  selectedIndicators,
  setSelectedIndicators,
  benchmarks,
  setBenchmarks,
  orgUnit,
}) {
  const classes = useStyles();
  const [infoModal, setInfoModal] = useState(null);
  const [editedDescription, setEditedDescription] = useState('');
  const [error, setError] = useState(null);

  const [editingKey, setEditingKey] = useState('');
  const engine = useDataEngine();

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

  const onEditBenchmark = e => {
    const { name, value } = e.target;
    setBenchmarks(prevState => {
      const updated = prevState.map(benchmark => {
        if (benchmark.name === name) {
          return { ...benchmark, value };
        }
        return benchmark;
      });
      return updated;
    });
  };

  const onBlurBenchmark = async e => {
    const { name, value } = e.target;
    const benchmark = benchmarks.find(benchmark => benchmark.name === name);
    if (benchmark) {
      await engine.mutate({
        resource: 'dataValues',
        type: 'create',
        params: {
          ou: orgUnit,
          de: benchmark.id,
          pe: new Date().getFullYear() - 1,
          value,
        },
      });
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
      rowSpan: indicator.indicatorDataValue.length?.toString(),
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
        </div>
      ),
      key: 'name',
      render: row => (
        <div className={classes.tableFlex}>
          <span>{row.name}</span>
        </div>
      ),
    },
    {
      name: (
        <PencilSquareIcon
          className={classes.edit}
          onClick={() =>
            editRow({
              categoryId: indicator?.categoryId,
              indicatorName: indicator?.indicatorName,
            })
          }
        />
      ),
      key: 'edit',
      width: '2rem',
      render: row => (
        <>
          {
            <PencilSquareIcon
              className={classes.edit}
              onClick={() => editRow(row)}
            />
          }
        </>
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
            disabled || checkDisable(indicator.categoryId, selectedIndicators)
          }
          checked={
            selectedIndicators?.find(
              ({ id, isLatest }) =>
                id === indicator.categoryId?.split('-')[0] &&
                isLatest === indicator.categoryId?.endsWith('-latest')
            )?.id
              ? true
              : false
          }
          onChange={({ checked }) => {
            if (checked) {
              setSelectedIndicators([
                ...selectedIndicators,
                {
                  id: indicator.categoryId?.split('-')[0],
                  isLatest: indicator.categoryId?.endsWith('-latest'),
                },
              ]);
            } else {
              setSelectedIndicators(
                selectedIndicators.filter(
                  ({ id }) => id !== indicator.categoryId?.split('-')[0]
                )
              );
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
      <div
        className={`${classes.benchmark} ${
          indicator.isLatestVersion ? classes.latest : classes.old
        }`}
      >
        <div>
          <h4>International Benchmark</h4>
          <ExclamationCircleIcon
            className={classes.info}
            onClick={() => setInfoModal(indicator)}
          />
          <p>{indicator?.internationalBenchmark || 0}</p>
        </div>
        <div>
          <h4>National Target</h4>
          <Input
            name={indicator.categoryName}
            value={
              benchmarks?.find(
                benchmark => benchmark.name === indicator.categoryName
              )?.value || ''
            }
            onChange={onEditBenchmark}
            onBlur={onBlurBenchmark}
            placeholder='National Target'
          />
        </div>
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
        referenceSheet={referenceSheet}
      />
    </div>
  );
}
