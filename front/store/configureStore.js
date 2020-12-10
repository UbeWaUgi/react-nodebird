// configureStore.js
// 리덕스 쓰기위한. 기본 설정
// store/configureStore.js
import { createWrapper } from 'next-redux-wrapper';
import { compose, createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga';
import reducer from '../reducers';
import rootSaga from '../sagas';


const loggerMiddleware = ({dispatch, getState}) => (next) => (action) => {

    if(typeof.action === 'function'){ //액션이 펑션인 경우 액션은 객체인데,
        //성크에서는 액션을 펑션으로 둘 수 있어서,
        //액션이 펑션일때 지연 함수 이기 때문에,
        return action(dispatch,getState);
        //이렇게 액션을 나중에 실행 해줄 수 있다.
    }

    //밑에 두줄은 액션 실행전에 콘솔로그 찍어주는 미들웨어
    console.log(action);
    return next(action); //액션을 실행
};
//액션 디스패치 되는것들 로깅하는 미들웨어
//미들웨어는 항상 화살표 3개
//3단 고차함수라 그래서
 

const configureStore = () => {
  const sagaMiddleware = createSagaMiddleware();
  const middlewares = [sagaMiddleware]; // 사가나 펑크 넣고 리덕스가
  // 우리가 만든 미들웨어는 여기에 담는다,,,!
  const enhancer = process.env.NODE_ENV === 'production'
    ? compose(applyMiddleware(...middlewares))
    : composeWithDevTools(applyMiddleware(...middlewares, loggerMiddleware));
    // 리덕스 히스토리를 보기위한 미들웨어 설정 배포 상태와 dev 상태를 나누어서 따로따로 적용해줘야함.
    // 히스토리가 쌓이면 메모리문제와, 그 데이터가 다 보이므로 보안 문제가 있어서,
    // 그래서 배포용은 devtools에 연결하고, 개발용은 devtools에 연결한다.

  const store = createStore(reducer, enhancer); // devtools연동을위한 enhancer 추가.

  store.sagaTask = sagaMiddleware.run(rootSaga);

  return store;
};

const wrapper = createWrapper(configureStore, {
  dubug: process.env.NODE_ENV === 'development',
  // dubug 가 트루면, 리덕스관해 자세한 설명이 나오기때문에 개발할때는 트루로 두는게 코딩에 편함.
});

export default wrapper;
