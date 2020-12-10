import { HYDRATE } from 'next-redux-wrapper';
import { combineReducers } from 'redux';
import user from './user';
import post from './post';

// async action creator

// asction creator
/*
const changeNickname = (data) => {
    return {
        type: 'CHANGE_NICKNAME',
        data,
    }
}
*/
// store.dispatch(changeNickname('이름')) 해버리면 된다. 이런식으로 함수를 만들어놓으면,

// hydrate...?
/*
const rootReducer = combineReducers({
  index: (state = {}, action) => { // 첫째 index 리듀서
    switch (action.type) {
      case HYDRATE: // 합치므로 없어두되는데 HYDRATE때문에 넣어준거,
        console.log('HYDATE', action);
        return { ...state, ...action.payload };

      default:
        return state;
    }
  },
  user,
  post, // 이렇게만해도 user와 post의 state는 combineReducers가 알아서 넣어준다.
});
*/
// (이전상태, 액션) => 다음상태
const rootReducer = (state, action) => {
  switch (action.type) {
    case HYDRATE:
      // console.log('HYDRATE', action);
      return action.payload;
    default: {
      const combinedReducer = combineReducers({
        user,
        post, // 얘네둘을 합친 리듀서 함수가 하나 생김.
      });
      return combinedReducer(state, action);
    }
  }
};

export default rootReducer;
