import { useState, useCallback } from 'react';

export default (initialValue = null) => {
  const [value, setValue] = useState(initialValue);
  const handler = useCallback((e) => {
    setValue(e.target.value);
  }, [value]);

  return [value, handler, setValue];
};

// 커스텀 훅이다.
// form에서 쓰는형태가 value 와 그에대한 useCallback을 넣은 이벤트성 함수니까...
// return 저 두개만 주는것
// 세개줘도됨,
// 다른 컴포넌트에서  const [id, onChangeId] = useInput(''); 이런식으로 사용가능.
