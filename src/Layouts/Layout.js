import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { DataQuery } from '@dhis2/app-runtime';
import Loader from '../components/Loader';
import templateRoutes from '../routes/templateRoutes';
import indicatorRoutes from '../routes/indicatorRoutes';
import surveyRoutes from '../routes/surveyRoutes';
import notificationRoutes from '../routes/notificationRoutes';
import configRoutes from '../routes/configRoutes';
import routineRoutes from '../routes/routineRoutes';
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
        position: 'fixed',
      },
    },
  },
  layout: {
    display: 'grid !important',
    gridTemplateColumns: '250px 1fr',
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

const createLink = (label, path) => <Link to={path}>{label}</Link>;

export default function MainLayout({ layout, user }) {
  const classes = useStyles();

  const baseUrl = window.location.origin;

  const sideLinks = [
    {
      label: <a href={baseUrl}>Dashboard</a>,
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
      label: 'Indicator Dictionary',
      key: 'indicators',
      children: [
        {
          label: createLink('Dictionary', '/indicators/dictionary'),
          key: 'dictionary',
        },
        {
          label: createLink('New Indicator', '/indicators/add'),
          key: 'newIndicator',
        },
      ],
    },
    {
      label: 'Surveys',
      key: 'surveys',
      children: [
        {
          key: 'menu',
          label: <Link to='/surveys/menu'>Surveys</Link>,
        },
        {
          key: 'create',
          label: <Link to='/surveys/create'>Create Survey</Link>,
        },
      ],
    },
    {
      label: <Link to='/routine'>Routine Data Submissions</Link>,
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
    ...routineRoutes,
    ...indicatorRoutes,
  ];

  return (
    <div className={classes.layout}>
      <Layout>
        <Sider
          width={250}
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
            <Route path='/' element={<Home user={user} />} />
            {routes.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                element={<route.element user={user} />}
              />
            ))}
          </Routes>
        </Content>
      </Layout>
    </div>
  );
}
