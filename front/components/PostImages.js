import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { PlusOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import ImagesZoom from './ImagesZoom';
import { backUrl } from '../config/config';

// 이거 왜안되지??
// SSR렌더링? 그문제??
const ImgStyle = styled.img`
    width:50%;
    display: inline-block;
`;

const PostImages = ({ images }) => {
  const [showImagesZoom, setShowImagesZoom] = useState(false);

  const onZoom = useCallback(() => {
    setShowImagesZoom(true);
  }, []);

  const onClose = useCallback(() => {
    setShowImagesZoom(false);
  }, []);

  if (images.length === 1) {
    return (
      <>
        <img
          role="presentation"
          src={process.env.NODE_ENV === 'production'
            ? (`${images[0].src}`) : (`${backUrl}/${images[0].src}`)}
          alt={images[0].src}
          onClick={onZoom}
        />
        {showImagesZoom && <ImagesZoom images={images} onClose={onClose} />}
      </>
    );
  } if (images.length === 2) {
    return (
      <>
        <ImgStyle
          role="presentation"
          style={{ width: '50%', display: 'inline-block' }}
          src={process.env.NODE_ENV === 'production'
            ? (`${images[0].src}`) : (`${backUrl}/${images[0].src}`)}
          alt={images[0].src}
          onClick={onZoom}
        />
        <ImgStyle
          role="presentation"
          style={{ width: '50%', display: 'inline-block' }}
          src={process.env.NODE_ENV === 'production'
            ? (`${images[1].src}`) : (`${backUrl}/${images[1].src}`)}
          alt={images[1].src}
          onClick={onZoom}
        />
        {showImagesZoom && <ImagesZoom images={images} onClose={onClose} />}
      </>
    );
  } if (images.length > 2) {
    return (
      <div>
        <ImgStyle
          role="presentation"
          style={{ width: '50%', display: 'inline-block' }}
          src={process.env.NODE_ENV === 'production'
            ? (`${images[0].src}`) : (`${backUrl}/${images[0].src}`)}
          alt={images[0].src}
          onClick={onZoom}
        />
        <div
          role="presentation"
          style={{ display: 'inline-block', width: '50%', textAlign: 'center', verticalAlign: 'middle' }}
          onClick={onZoom}
        >
          <PlusOutlined />
          <br />
          {images.length - 1}
          개의 사진 더보기
        </div>
        {showImagesZoom && <ImagesZoom images={images} onClose={onClose} />}
      </div>
    );
  }
  return (<div>오류...? 없는건가? 확인....</div>);
};

PostImages.propTypes = {
  images: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default PostImages;
