import React, { useCallback, useEffect } from 'react';
import { Form, Input, Button } from 'antd';
import Link from 'next/link';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import useInput from '../hooks/useInput';
import { loginRequestAction } from '../reducers/user';

const ButtonWrapper = styled.div`
    margin-top:10px;
`;

const FormWrapper = styled(Form)`
    padding : 10px;
`;

//  styled 컴포넌트 불러와서 이렇게 처리하면, ButtonWrapper는 div컴포넌트가 된다.
//  div컴포넌트이면서 css가 적용된 ButtonWrapper라는 컴포넌트가 생김.

const LoginForm = () => {
  const dispatch = useDispatch();
  const { logInLoading, logInError } = useSelector((state) => state.user);

  const [email, onChangeEmail] = useInput('');
  // 커스텀 훅 으로 정의.

  const [password, onChangePassword] = useInput('');

  useEffect(() => {
    if (logInError) {
      alert(logInError);
    }
  }, [logInError]);

  const onSubmitForm = useCallback(() => {
    // console.log(email, password);
    dispatch(loginRequestAction({ email, password }));
  }, [email, password]);

  // antd는 htmlType = submit 하면 form에 onFinish가 활성화됨.
  // onFinish는 e.preventDefault가 적용되어 되어있다.
  return (
    <FormWrapper onFinish={onSubmitForm}>
      <div>
        <label htmlFor="user-email">이메일</label>
        <br />
        <Input name="user-email" value={email} onChange={onChangeEmail} required />
      </div>

      <div>
        <label htmlFor="user-password">비밀번호</label>
        <br />
        <Input name="user-password" value={password} onChange={onChangePassword} required />
      </div>

      <ButtonWrapper>
        <Button type="primary" htmlType="submit" loading={logInLoading}>
          로그인
        </Button>
        <Link href="/signup"><a><Button>회원가입</Button></a></Link>
      </ButtonWrapper>

    </FormWrapper>
  );
};

export default LoginForm;
