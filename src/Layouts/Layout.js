import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DataQuery } from '@dhis2/app-runtime';
import Main from '../components/Main';
import Loader from '../components/Loader';
import templateRoutes from '../routes/templateRoutes';
import surveyRoutes from '../routes/surveyRoutes';
import notificationRoutes from '../routes/notificationRoutes';

export default function Layout({ layout, user }) {
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

  const notificationLinks = [
    {
      label: 'Notifications',
      path: '/notifications/list',
    },
    {
      label: 'Notification Settings',
      path: '/notifications/settings',
    },
  ];

  const routes = {
    Templates: templateRoutes,
    Surveys: surveyRoutes,
    Notifications: notificationRoutes,
  };

  return (
    <DataQuery query={query}>
      {({ error, loading, data }) => {
        if (error) return <span>ERROR</span>;
        if (loading) return <Loader />;
        return (
          <Main
            sideLinks={
              layout === 'Templates'
                ? templateLinks
                : layout === 'Surveys'
                ? surveyLinks
                : notificationLinks
            }
            title={
              layout === 'Templates'
                ? 'Local Master Indicator Template'
                : layout === 'Surveys'
                ? 'Survey Menu'
                : 'Notifications Menu'
            }
            showDashboard={true}
          >
            <Routes>
              {routes[layout].map((route, index) => (
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
