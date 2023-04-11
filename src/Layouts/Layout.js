import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { DataQuery } from '@dhis2/app-runtime';
import { Menu, MenuItem } from '@dhis2/ui';
import Main from '../components/Main';
import { getOrganizationUnit } from '../api/api';
import Loader from '../components/Loader';
import templateRoutes from '../routes/templateRoutes';
import surveyRoutes from '../routes/surveyRoutes';

export default function Layout({ layout, user }) {
  const [organizations, setOrganizations] = useState([]);

  useEffect(() => {
    getOrganizationUnit().then(organization => {
      setOrganizations(organization?.details);
    });
  }, []);

  const query = {
    me: {
      resource: 'me',
    },
  };

  const templateLinks = [
    {
      label: 'Versions',
      path: '/templates/versions',
    },
    {
      label: 'Add a New Version',
      path: '/templates/versions/new',
    },
  ];

  const surveyLinks = [
    {
      label: 'Create Survey',
      path: '/surveys/create',
    },
    {
      label: 'Surveys',
      path: '/surveys/menu',
    },
  ];

  return (
    <DataQuery query={query}>
      {({ error, loading, data }) => {
        if (error) return <span>ERROR</span>;
        if (loading) return <Loader />;
        return (
          <Main
            organizations={organizations}
            sideLinks={layout === 'Templates' ? templateLinks : surveyLinks}
            title={
              layout === 'Templates'
                ? 'Local Master Indicator Template'
                : 'Survey Menu'
            }
          >
            <Routes>
              {layout === 'Templates'
                ? templateRoutes.map((route, index) => (
                    <Route
                      key={index}
                      path={route.path}
                      element={<route.element user={data} />}
                    />
                  ))
                : surveyRoutes.map((route, index) => (
                    <Route
                      key={index}
                      path={route.path}
                      element={<route.element user={data} />}
                    />
                  ))}
            </Routes>
          </Main>
        );
      }}
    </DataQuery>
  );
}
