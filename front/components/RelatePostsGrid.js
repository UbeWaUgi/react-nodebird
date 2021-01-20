import React from 'react';
import { Card } from 'antd';
import Link from 'next/link';
import styled from 'styled-components';

const CardStyled = styled(Card)`
margin-top: 10px;
`;

const GridStyled = styled(Card.Grid)`
width: 50%;
text-align: center;
`;

const LinkAStyled = styled.a`
color: rgba(0, 0, 0, 0.45);
`;

const RelatePostsGrid = () => (
  <>
    <CardStyled title="RelatePosts">
      <GridStyled><Link href="/relate/relatePosts"><LinkAStyled>관련 글</LinkAStyled></Link></GridStyled>
      <GridStyled><Link href="/relate/unrelatePosts"><LinkAStyled>관련없는 글</LinkAStyled></Link></GridStyled>
    </CardStyled>
  </>
);

export default RelatePostsGrid;
