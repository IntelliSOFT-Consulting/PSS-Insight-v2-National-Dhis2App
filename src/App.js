import React from 'react';
import { DataQuery } from '@dhis2/app-runtime';
import { Menu, MenuItem } from '@dhis2/ui';
import i18n from '@dhis2/d2-i18n';
import './App.module.css';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  '@global': {
    'svg.checked.disabled': {
      fill: '#D7D8D8 !important',
      '& .background': {
        fill: '#D7D8D8 !important',
      },
    },
  },
});

import Layout from './Layouts/Layout';
import './customs.css';

const query = {
  me: {
    resource: 'me',
    params: {
      fields: 'id,displayName,organisationUnits[id,name]',
    },
  },
};

const MyApp = () => {
  const classes = useStyles();
  return (
    <HashRouter>
      <div className={classes.root}>
        <DataQuery query={query}>
          {({ error, loading, data }) => {
            if (error) return <span>ERROR</span>;
            if (loading) return <span>...</span>;
            return (
              <Routes>
                <Route path='/*' user={data} element={<Layout user={data} />} />
              </Routes>
            );
          }}
        </DataQuery>
      </div>
    </HashRouter>
  );
};

export default MyApp;
