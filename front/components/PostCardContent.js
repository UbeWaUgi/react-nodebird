import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { Input, Button } from 'antd';
import { useSelector } from 'react-redux';

const PostCardContent = ({ postData, editMode, onCancleUpdate,
  onChangePost }) => { // 첫 번째 게시글 #해시태크 #익스프레스
  const { updatePostLoading, updatePostDone } = useSelector((state) => state.post);

  const [editText, setEditText] = useState(postData);

  useEffect(() => {
    if (updatePostDone) {
      onCancleUpdate();
    }
  }, [updatePostDone]);

  const onChangeText = useCallback((e) => {
    setEditText(e.target.value);
  }, []);

  return (
    <>
      <div>
        {editMode
          ? (
            <>
              <Input.TextArea
                value={editText}
                onChanage={onChangeText}
              />
              <Button.Group>
                <Button loading={updatePostLoading} onClick={onChangePost(editText)}>수정</Button>
                <Button onClick={onCancleUpdate}>취소</Button>
              </Button.Group>
            </>
          )
          : postData.split(/(#[^\s#]+)/g).map((v) => {
            if (v.match(/(#[^\s#]+)/)) {
              return <Link href={`/hashtag/${v.slice(1)}`} prefetch={false} key={v}><a>{v}</a></Link>;
            }
            return v;
          })}
      </div>
    </>
  );
};

PostCardContent.propTypes = {
  postData: PropTypes.string.isRequired,
  editMode: PropTypes.bool,
  onCancleUpdate: PropTypes.func.isRequired,
  onChangePost: PropTypes.func.isRequired,
};

PostCardContent.defaultProps = {
  editMode: false,
}; // 기본적으로 값이 없을수도 있음 왜냐? 리트윗 게시글은 수정기능이 없으니
// postCard에 editmode가 필요없어서 값이 없을수도 있음, 그럴땐 이렇게 정해버리면 그값의 디폴트를 지정가능.
// 위에 proptypes에서 required를 지정을 안해줬으므로 이것을 추가

export default PostCardContent;
