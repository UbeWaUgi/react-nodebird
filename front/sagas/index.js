import { all, fork } from 'redux-saga/effects';
// 사가의 이펙트
import axios from 'axios';
import postSaga from './post';
import userSaga from './user';
import { backUrl } from '../config/config';

// axios.defaults.baseURL = 'http://localhost:3065';
axios.defaults.baseURL = backUrl;
axios.defaults.withCredentials = true; // 사가에서 보내는 axios 는 withCredentials가 트루가 공통적으로 들어간다.

export default function* rootSaga() {
  // all 배열안에 있는것들을 한번에 실행한다.
  // fork 함수를 실행한다.
  //
  yield all([
    fork(postSaga),
    fork(userSaga),
  ]);
}
