const passport = require('passport');
const local = require('./local');
const {User} = require('../models');

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id); //해당 아이디만 저장! (세션)
  })  

  passport.deserializeUser(async(id, done) => { //해당 정보 찾는것,
    try{
      const user = await User.findOne({where : {id}});
      done(null, user); //req.uesr
    }catch(error){
      console.error(error);
      done(error);
    }
  }); //로그인 성공후 그다음 요청 제로초 로그인하면, 아이디가 저장이 되어있겠고,
  //그다음 요청부터는 매다음 이것이 실행되서 아이디로부터 db검색해서 사용자 정보 복구해낸다.
  //그래서 req.user에 넣어준다.

  local();
};