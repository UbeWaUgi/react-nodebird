import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import axios from 'axios';
import { END } from 'redux-saga';
import AppLayout from '../../components/AppLayout';
import PostCard from '../../components/PostCard';
import wrapper from '../../store/configureStore';
import { LOAD_MY_INFO_REQUEST } from '../../reducers/user';
import { LOAD_DATE_POSTS_REQUEST } from '../../reducers/post';

const DatePost = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { date } = router.query;
  const { mainPosts, hasMorePost, loadPostsLoading } = useSelector((state) => state.post);

  console.log('date Post Page');
  console.log(date);

  return (
    <AppLayout>
      {mainPosts.map((c) => (
        <PostCard key={c.id} post={c} />
      ))}
    </AppLayout>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
  const cookie = context.req ? context.req.headers.cookie : '';

  axios.defaults.headers.Cookie = '';
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }

  context.store.dispatch({
    type: LOAD_MY_INFO_REQUEST,
  });

  context.store.dispatch({
    type: LOAD_DATE_POSTS_REQUEST,
    date: context.params.date,
  });

  context.store.dispatch(END);
  await context.store.sagaTask.toPromise();
});

export default DatePost;
