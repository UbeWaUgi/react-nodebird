import React, { useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { Input, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { UPDATE_IMAGES_REQUEST, REMOVE_UPDATE_IMAGE, CANCLE_UPDATE_POST } from '../reducers/post';
import { backUrl } from '../config/config';

const PostCardContent = ({ editMode, postData, postId, postImages, setEditMode,
  onChangePost }) => { // 첫 번째 게시글 #해시태크 #익스프레스
  const dispatch = useDispatch();
  const { updatePostLoading } = useSelector((state) => state.post);

  const [editText, setEditText] = useState(postData);
  const orgImg = postImages;
  // 취소시 적어놨던 글 되돌리기.

  const onCancleUpdate = useCallback(() => {
    setEditMode(false);
    dispatch({
      type: CANCLE_UPDATE_POST,
      Images: orgImg,
      content: postData,
      postId,
    });
  }, [postId]);

  const onChangeText = useCallback((e) => {
    setEditText(e.target.value);
  });

  const onChangeImages = useCallback((e) => {
    const imageFormData = new FormData();
    [].forEach.call(e.target.files, (f) => {
      imageFormData.append('image', f);

      dispatch({
        type: UPDATE_IMAGES_REQUEST,
        data: imageFormData,
        postId,
      });
    });
  });

  const imageInput = useRef();

  const onClickImageUpload = useCallback(() => {
    imageInput.current.click();
  }, [imageInput.current]);

  const onRemoveImage = useCallback((index) => () => {
    dispatch({
      type: REMOVE_UPDATE_IMAGE,
      data: index,
      postId,
    });
  });

  return (
    <>
      <div>
        {editMode
          ? (
            <>
              <div>
                <input type="file" name="image" multiple hidden ref={imageInput} onChange={onChangeImages} />
                <Button onClick={onClickImageUpload}>이미지 업로드</Button>
              </div>
              <div>
                {postImages.map((v, i) => (
                  <div key={v + i} style={{ display: 'inline-block' }}>
                    {process.env.NODE_ENV === 'production' ? ((<img src={`${v.src.replace(/\/thumb\//, '/original/')}`} style={{ width: '200px' }} alt={v.src} />))
                      : (<img src={`${backUrl}/${v.src}`} style={{ width: '200px' }} alt={v.src} />)}
                    <div>
                      <Button onClick={onRemoveImage(i)}>제거</Button>
                    </div>
                  </div>
                ))}

              </div>
              <Input.TextArea
                value={editText}
                onChange={onChangeText}
              />
              <Button.Group>
                <Button loading={updatePostLoading} onClick={onChangePost(editText)}>수정</Button>
                <Button onClick={onCancleUpdate}>취소</Button>
              </Button.Group>
            </>
          )
          : (
            <>
              {postData && postData.split(/(#[^\s#]+)/g).map((v, i) => {
                // 하나 알아 둘것.! 여러 반복문에서 Link같은거에 key값이 중복이된다면,
                // 해당 DOM? 해당영역 관련해서 무엇인가 처리를할경우 중복중 하나가 제외됨
                // 예를들어 #람다 #람다 #트린 이렇게해서 수정을 할경우
                // 전체다 textarea가 되지않고, 중복중 하나인 #람다 하나가 textArea안으로들어가지 않음.
                if (v.match(/(#[^\s#]+)/)) {
                  return <Link href={`/hashtag/${v.slice(1)}`} prefetch={false} key={v + i}><a>{v}</a></Link>;
                }
                return v;
              })}
            </>
          )}
      </div>
    </>
  );
};

/*
<div>
<input type="file" name="image" multiple hidden ref={imageInput} onChange={onChangeImages} />
<Button onClick={onClickImageUpload}>이미지 업로드</Button>
<Button type="primary" style={{ float: 'right' }} htmlType="submit">짹짹</Button>
</div>
<div>
{imagePaths.map((v, i) => (
  <div key={v} style={{ display: 'inline-block' }}>
    {process.env.NODE_ENV === 'production' ? (<img src={`${v.replace(/\/thumb\//, '/original/')}`} style={{ width: '200px' }} alt={v} />)
      : (<img src={`${backUrl}/${v}`} style={{ width: '200px' }} alt={v} />) }

    <div>
      <Button onClick={onRemoveImage(i)}>제거</Button>
    </div>
  </div>
))}
</div>
*/

PostCardContent.propTypes = {
  postData: PropTypes.string.isRequired,
  editMode: PropTypes.bool,
  setEditMode: PropTypes.func.isRequired,
  onChangePost: PropTypes.func.isRequired,
  postImages: PropTypes.array.isRequired,
  postId: PropTypes.number.isRequired,
};

PostCardContent.defaultProps = {
  editMode: false,
}; // 기본적으로 값이 없을수도 있음 왜냐? 리트윗 게시글은 수정기능이 없으니
// postCard에 editmode가 필요없어서 값이 없을수도 있음, 그럴땐 이렇게 정해버리면 그값의 디폴트를 지정가능.
// 위에 proptypes에서 required를 지정을 안해줬으므로 이것을 추가

export default PostCardContent;
