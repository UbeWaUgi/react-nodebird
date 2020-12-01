// import React from 'react'; 넥스트는 이구문이 필요없다 있어도 없어도된다.
// jsx를 썼을때 리액트임을 알려줘야하는데 넥스트는 필요없음.
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { END } from 'redux-saga';
import axios from 'axios';
import AppLayout from '../components/AppLayout';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import { LOAD_POSTS_REQUEST } from '../reducers/post';
import { LOAD_MY_INFO_REQUEST } from '../reducers/user';
import wrapper from '../store/configureStore';

const Home = () => {
  const dispatch = useDispatch();
  const { me } = useSelector((state) => state.user);
  const { mainPosts, hasMorePost,
    loadPostsLoading, retweetError } = useSelector((state) => state.post);

  useEffect(() => {
    if (retweetError) {
      alert(retweetError);
    }
  }, [retweetError]);

  // 화면로딩후에 해당 useEffect가 실행됨.
  // 여기서 그 화면 로딩때 사용자없고 게시글 없다가
  // 데이터공백이였다가, 채워지는거야...!
  // 그러면 화면로딩하기전에 미리 데이터를 가지고와서 채워주는게 있다면??
  // Home Component보다 먼저 시작될것이 필요.

  useEffect(() => {
    function onScroll() {
      // console.log(window.scrollY, document.documentElement.clientHeight,
      // document.documentElement.scrollHeight);

      if (window.scrollY + document.documentElement.clientHeight
         > document.documentElement.scrollHeight - 300) {
        if (hasMorePost && !loadPostsLoading) {
          const lastId = mainPosts[mainPosts.length - 1]?.id;
          dispatch({
            type: LOAD_POSTS_REQUEST,
            lastId,
          });
        }
      }
    }

    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
    }; // window Event리스너 를 useEffect에다 적용시키면 꼭 리턴을 해줘야
    // 메모리 문제가 안생김.
  }, [hasMorePost, loadPostsLoading, mainPosts]);

  return (
    <AppLayout>
      {me && <PostForm />}
      {mainPosts.map((post) => <PostCard key={post.id} post={post} />)}

    </AppLayout>
  );
  // AppLayout안에 있는것이 결국 인자값으로 감 노드인 값이 간다.
};

// Home.getInitialProps : //조만간사라질 애라서 쓰지말자...

// Hydrate
export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
  const cookie = context.req ? context.req.headers.cookie : '';
  axios.defaults.headers.Cookie = '';
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }

  // 이것이 있으면, Home보다 먼저 실행됨.
  // Context 안에 store가 있음. 그 store안에는 dispatch가 있음.
  console.log(context);
  console.log('serverside');
  context.store.dispatch({
    type: LOAD_MY_INFO_REQUEST,
  });

  context.store.dispatch({
    type: LOAD_POSTS_REQUEST,
  });
  // 해당 라이프사이클은 홈이 구성되기전에 먼저 실행되므로
  // 홈이구성될때 리덕스 데이터가 채워져있다.

  context.store.dispatch(END);
  await context.store.sagaTask.toPromise();
  // 이두개가 디스패치가 끝날때 까지 기다려주는것들임!!

  // 그런데 disptach하면... 리퀘스트만 보내고 그냥 끝나버림. 그이후 오는것들도 못받고!!
});

export default Home;
