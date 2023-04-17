import React from 'react';
import { DataQuery } from '@dhis2/app-runtime';
import { Menu, MenuItem } from '@dhis2/ui';
import i18n from '@dhis2/d2-i18n';
import './App.module.css';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';

import Layout from './Layouts/Layout';
import Home from './Pages/Home';
import './customs.css';

const query = {
  me: {
    resource: 'me',
    params: {
      fields: 'id,displayName,organisationUnits[id,name]',
    }
  },
};

const MyApp = () => (
  <HashRouter>
    <div>
      <DataQuery query={query}>
        {({ error, loading, data }) => {
          if (error) return <span>ERROR</span>;
          if (loading) return <span>...</span>;
          return (
            <Routes>
              <Route
                path='/templates/*'
                element={<Layout layout='Templates' user={data} />}
              />
              <Route
                path='/surveys/*'
                element={<Layout layout='Surveys' user={data} />}
              />
              <Route path='/*' element={<Home />} />
            </Routes>
          );
        }}
      </DataQuery>
    </div>
  </HashRouter>
);

export default MyApp;
