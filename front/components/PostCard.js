import React, { useCallback, useState, useEffect } from 'react';
import { Button, Card, Avatar, Popover, List, Comment } from 'antd';
import { RetweetOutlined, HeartOutlined, MessageOutlined, EllipsisOutlined, HeartTwoTone } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import moment from 'moment';
import PostImages from './PostImages';
import CommentForm from './CommentForm';
import PostCardContent from './PostCardContent';
import { REMOVE_POST_REQUEST, LIKE_POST_REQUEST, UNLIKE_POST_REQUEST, RETWEET_REQUEST, UPDATE_POST_REQUEST, CANCLE_UPDATE_POST } from '../reducers/post';
import FollowButton from './FollowButton';

moment.locale('ko'); // 한글로 바꿔주고,

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const { removePostLoading, updatePostDone } = useSelector((state) => state.post);
  const [commentFormOpened, setCommentFormOpened] = useState(false);
  const id = useSelector((state) => state.user.me?.id);
  const liked = post.Likers.find((v) => v.id === id);
  const [editMode, setEditMode] = useState(false);

  // 취소시 이미지 수정한거 되돌리기.
  // 맨처음 실행될때 post.Images가 변하지 않은상태에서 한번 실행되기때문에,
  // 이렇게해도 원래값이 변하지 않음.

  const updateForSetEdit = useCallback(() => {
    if (editMode) {
      setEditMode(false);
    }
  }, [editMode]);

  useEffect(() => {
    updateForSetEdit();
  }, [updatePostDone]);

  const onChangePost = useCallback((editText) => async () => {
    if (!id) {
      return alert('로그인이 필요합니다.');
    }

    const images = [];
    post.Images.map((p) => images.push(p.src));
    return dispatch({
      type: UPDATE_POST_REQUEST,
      data: {
        image: images,
        content: editText,
      },
      postId: post.id,

    });
  }, [id, post, post.Images]);

  const onLike = useCallback(() => {
    if (!id) {
      return alert('로그인이 필요합니다.');
    }

    return dispatch({
      type: LIKE_POST_REQUEST,
      data: post.id,
    });
  }, [id]);

  const onUnLike = useCallback(() => {
    if (!id) {
      return alert('로그인이 필요합니다.');
    }

    return dispatch({
      type: UNLIKE_POST_REQUEST,
      data: post.id,
    });
  }, [id]);

  const onToggleComment = useCallback(() => {
    setCommentFormOpened((prev) => !prev);
  });

  const onRemovePost = useCallback(() => {
    if (!id) {
      return alert('로그인이 필요합니다.');
    }
    return dispatch({
      type: REMOVE_POST_REQUEST,
      data: post.id,
    });
  }, [id]);

  const onClickUpdate = useCallback(() => {
    if (!id) {
      return alert('로그인이 필요합니다.');
    }
    setEditMode(true);
  }, [id]);

  const onRetweet = useCallback(() => {
    if (!id) {
      return alert('로그인이 필요합니다.');
    }

    return dispatch({
      type: RETWEET_REQUEST,
      data: post.id,
    });
  }, [id]);

  /*
    const {me} = useSelector((state) => state.user);
    const id = me && me.id;
    console.log('test');
    console.log(id);
    console.log(me);
    */
  /*
    위와 같은 뜻임
    const {me} = useSelector((state) => state.user);
    const id = me?.id; //const id = me && me.id; 와 같은 문법
    //me가 있고 me.id가 있으면 id에넣어주고, 없으면 undefined를 넣어주는 옵셔널 체이닝 연산자
    */
  return (
    <div style={{ marginBottom: 20 }}>
      <Card
        cover={!editMode ? post.Images[0] && <PostImages images={post.Images} /> : ''}
        actions={[
          <RetweetOutlined key="retweet" onClick={onRetweet} />,
          liked
            ? <HeartTwoTone twoToneColor="#eb2f96" key="heart" onClick={onUnLike} />
            : <HeartOutlined key="heart" onClick={onLike} />,
          <MessageOutlined key="comment" onClick={onToggleComment} />,
          <Popover
            key="more"
            content={(
              <Button.Group>
                {id && post.User.id === id ? (
                  <>
                    {!post.RetweetId && <Button onClick={onClickUpdate}>수정</Button> }
                    <Button type="danger" loading={removePostLoading} onClick={onRemovePost}>삭제</Button>
                  </>
                )
                  : <Button>신고</Button> }
              </Button.Group>
                    )}
          >
            <EllipsisOutlined />
          </Popover>,
        ]}
        title={post.RetweetId ? `${post.User.nickname}님이 리트윗 하셨습니다.` : null}
        extra={id && <FollowButton post={post} />}
      >
        {post.RetweetId && post.Retweet
          ? (
            <Card
              cover={post.Retweet.Images[0] && <PostImages images={post.Retweet.Images} />}
            >
              <div style={{ float: 'right' }}>{moment(post.createdAt).format('YYYY.MM.DD')}</div>
              <Card.Meta
                avatar={<Link href={`/user/${post.Retweet.User.id}`} prefetch={false}><a><Avatar>{post.Retweet.User.nickname[0]}</Avatar></a></Link>}
                title={post.Retweet.User.nickname}
                description={(
                  <PostCardContent
                    postData={post.Retweet.content}
                    postId={post.id}
                    postImages={post.Images}
                    setEditMode={setEditMode}
                    onChangePost={onChangePost}
                  />
)}
              />
            </Card>
          )
          : (
            <>
              <div style={{ float: 'right' }}>{moment(post.createdAt).format('YYYY.MM.DD')}</div>
              <Card.Meta
                avatar={<Link href={`/user/${post.User.id}`} prefetch={false}><a><Avatar>{post.User.nickname[0]}</Avatar></a></Link>}
                title={post.User.nickname}
                description={(
                  <PostCardContent
                    editMode={editMode}
                    postData={post.content}
                    postId={post.id}
                    postImages={post.Images}
                    setEditMode={setEditMode}
                    onChangePost={onChangePost}
                  />
)}
              />
            </>
          )}
      </Card>

      {commentFormOpened && (
      <div>
        <CommentForm post={post} />
        <List
          header={`${post.Comments.length}개의 댓글`}
          itemLayout="horizontal"
          dataSource={post.Comments}
          renderItem={(item) => (
            <li>
              <Comment
                author={item.User.nickname}
                avartar={<Link href={`user/${item.User.id}`} prefetch={false}><a><Avatar>{item.User.nickname[0]}</Avatar></a></Link>}
                content={item.content}
              />
            </li>
          )}
        />
      </div>
      )}
    </div>
  /* <CommentForm /> */
  /* <Comments /> */
  );
};

PostCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.number,
    User: PropTypes.object,
    content: PropTypes.string,
    createAt: PropTypes.string,
    Comments: PropTypes.arrayOf(PropTypes.object),
    Images: PropTypes.arrayOf(PropTypes.object),
    Likers: PropTypes.arrayOf(PropTypes.object),
    RetweetId: PropTypes.number,
    Retweet: PropTypes.objectOf(PropTypes.any),
  }).isRequired,
};

export default PostCard;
