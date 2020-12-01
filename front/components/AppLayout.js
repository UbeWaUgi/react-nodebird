import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link'; //    넥스트 자체 링크 컴포넌트
import { Menu, Input, Row, Col } from 'antd';
import styled, { createGlobalStyle } from 'styled-components';
import { useSelector } from 'react-redux';
import Router from 'next/router';
import UserProfile from './UserProfile';
import LoginForm from './LoginForm';
import useInput from '../hooks/useInput';

const SearchInput = styled(Input.Search)`
    vertical-align : middle;
`;
//  이건 antd인 Input의 Search의 스타일을 커스텀하는 방법.
//  vertical align 스타일이 middle인 InputSearch가 담겨있다.

//  const style = useMemo(() => ({marginTop : 10}), []);
//  이런식으로 해서 넣어줘도 된다.

const Global = createGlobalStyle`
    .ant row {
        margin-left : 0 !important;
        margin-right: 0 !important;
    }

    .ant-col:first-child {
        padding-left: 0 !important;
    }

    .ant-col:last-child {
        padding-right: 0 !important;
    }
    
`;
// col 부분은 왜?? 알아보자..;

const AppLayout = ({ children }) => {
  // const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [searchInput, onChangeSearchInput] = useInput('');

  const me = useSelector((state) => state.user.me);

  const onSearch = useCallback(() => {
    Router.push(`/hashtag/${searchInput}`);
    // 주소를 옮길때는 라우터를 이용.
  }, [searchInput]);

  // state에서부터 state.user.isLoggedIn을 받아온다.
  // isLoggedIn이 바뀌면, 알아서 appLayout이 리렌더링된다.

  return (
    <div>
      <Global />
      <Menu mode="horizontal">
        <Menu.Item>
          <Link href="/"><a>노드버드</a></Link>
        </Menu.Item>
        <Menu.Item>
          <Link href="/profile"><a>프로필</a></Link>
        </Menu.Item>
        <Menu.Item>
          <SearchInput
            enterButton
            value={searchInput}
            onChange={onChangeSearchInput}
            onSearch={onSearch}
            style={{ verticalAlign: 'middle' }}
          />
        </Menu.Item>
      </Menu>
      <Row gutter={8}>
        <Col xs={24} md={6}>
          {me ? <UserProfile /> : <LoginForm />}
        </Col>
        <Col xs={24} md={12}>
          {children}
        </Col>
        <Col xs={24} md={6}>
          <a href="https://www.zerocho.com" target="_blank" rel="noreferrer noopener">Made by ZeroCho</a>
        </Col>
      </Row>

    </div>
  );
};

// 첫 Col은 모바일 꽉 데스크탑 6
// 두번째 표현할것은 모바일 꽉 데스크탑 12로
// 세번째 표현할것은 모바일 꽉 테스크탑 6 인데,
// 모바일 일 때는 스택처럼
// 모바일일때  1
//           2
//           3 이렇게 표현이 되는데, 세로로 배치되는데
// 데스크탑일때(넓혀서)
// 1(6)(25%)  2(12)(50%)  3(6)(25%) 가로로 배치된다.

// 최대 공간이 24이므로 만약 모바일때도 둘이 합쳐서 26이되면
// 24가 넘어서 첫번째꺼 표현 그다음으로 다음줄로 넘어간다.

AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
  // 칠드런은 React의 노드 , 노드 js의 노드가아닌 화면에 그리는 노드를 말함
  // 리턴안에 그릴수있는 모든 노드를 뜻함.
  // 그래서 칠드런은 노드이다 라는 뜻.
};

export default AppLayout;
