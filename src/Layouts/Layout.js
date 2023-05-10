import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { DataQuery } from '@dhis2/app-runtime';
import Loader from '../components/Loader';
import templateRoutes from '../routes/templateRoutes';
import surveyRoutes from '../routes/surveyRoutes';
import notificationRoutes from '../routes/notificationRoutes';
import configRoutes from '../routes/configRoutes';
import { Layout, Menu } from 'antd';
import Home from '../Pages/Home';
import { createUseStyles } from 'react-jss';

const { Content, Sider } = Layout;

const useStyles = createUseStyles({
  '@global': {
    '.ant-layout': {
      backgroundColor: '#f0f2f5',
      '& .ant-layout-sider': {
        backgroundColor: '#fff',
      },
    },
  },
  layout: {
    display: 'grid !important',
    gridTemplateColumns: '200px 1fr',
    gridTemplateRows: '1fr',
    gridTemplateAreas: '"sidebar main"',
    minHeight: 'calc(100vh - 48px)',
    '& .ant-menu-item-selected': {
      backgroundColor: '#B9D2E0 !important',
      borderRadius: '0px !important',
      color: '#0266B9 !important',
    },
    '& .ant-menu-submenu-selected >.ant-menu-submenu-title': {
      color: '#0266B9 !important',
    },
    '& li': {
      '& :hover': {
        borderRadius: '0px !important',
      },
    },
  },
});

export default function MainLayout({ layout, user }) {
  const classes = useStyles();
  const query = {
    me: {
      resource: 'me',
    },
  };

  const sideLinks = [
    {
      label: <Link to='/'>Dashboard</Link>,
      key: 'dashboard',
    },
    {
      label: 'Templates',
      key: 'templates',
      children: [
        {
          label: <Link to='/templates/versions'>Versions</Link>,
          key: 'versions',
        },
        {
          key: 'new',
          label: <Link to='/templates/versions/new'>New Version</Link>,
        },
      ],
    },
    {
      label: 'Surveys',
      key: 'surveys',
      children: [
        {
          key: 'create',
          label: <Link to='/surveys/create'>Create Survey</Link>,
        },
        {
          key: 'menu',
          label: <Link to='/surveys/menu'>Surveys</Link>,
        },
      ],
    },
    {
      label: 'Notifications',
      key: 'notifications',
      children: [
        {
          label: <Link to='/notifications/list'>Notifications</Link>,
          key: 'list',
        },
        {
          label: (
            <Link to='/notifications/settings'>Notification subscription</Link>
          ),
          key: 'settings',
        },
      ],
    },
    {
      label: <Link to='/configurations'>Configurations</Link>,
    },
  ];

  const routes = [
    ...templateRoutes,
    ...surveyRoutes,
    ...notificationRoutes,
    ...configRoutes,
  ];

  return (
    <DataQuery query={query}>
      {({ error, loading, data }) => {
        if (error) return <span>ERROR</span>;
        if (loading) return <Loader />;
        return (
          <div className={classes.layout}>
            <Layout>
              <Sider
                width={200}
                style={{
                  minHeight: 'calc(100vh - 48px)',
                }}
              >
                <Menu
                  mode='inline'
                  defaultSelectedKeys={['1']}
                  defaultOpenKeys={['sub1']}
                  style={{
                    height: '100%',
                    borderRight: 0,
                  }}
                  items={sideLinks}
                />
              </Sider>
            </Layout>
            <Layout
              style={{
                padding: '0 24px 24px',
              }}
            >
              <Content
                style={{
                  padding: 24,
                  margin: 0,
                  minHeight: 280,
                }}
              >
                <Routes>
                  <Route path='/' element={<Home user={data} />} />
                  {routes.map((route, index) => (
                    <Route
                      key={index}
                      path={route.path}
                      element={<route.element user={data} />}
                    />
                  ))}
                </Routes>
              </Content>
            </Layout>
          </div>
        );
      }}
    </DataQuery>
  );
}
