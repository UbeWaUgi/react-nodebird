import React from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import 'antd/dist/antd.css';

import wrapper from '../store/configureStore';

const NodeBird = ({ Component }) => (
  <>
    <Head>
      <title>NodeBird</title>
    </Head>
    <Component />
  </>
);

NodeBird.propTypes = {
  Component: PropTypes.elementType.isRequired,
};

export default wrapper.withRedux(NodeBird);
// createWrapper는 기존에 쓰는 라이프사이클에 redux를 결합시키는 역할
// 여기서는 _app.js이므로 전체 페이지에 redux 라이프사이클을 추가하겠다는 의미.
