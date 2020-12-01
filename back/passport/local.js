const passport = require('passport');
const {Strategy: LocalStrategy} = require('passport-local');
//Strategy : LocalStrategy 이름을 왼쪽으로 그대로 써도되고 : 뒤에 붙은 이름으로 변경해서 쓴다.
const { User } = require('../models');
const bcrypt = require('bcrypt');

module.exports = () => {
    passport.use(new LocalStrategy({
        usernameField: 'email', //사가에서 백서버로 보낼때 해당 변수의 값 그대로.
        passwordField: 'password'
        //이부분은 req.body에대한 설정
    }, async (email, password, done) => {
        //로그인 전략
        try{
            const user =  await User.findOne({
                where: {email}
            });
            if(!user) {
                
                return done(null, false, {reason: '존재하지 않는 이메일입니다!'}) 
            }
            const result = await bcrypt.compare(password, user.password)
            //compare도 비동기함수
            if(result) {
                return done(null, user);
            }
    
            return done(null,false,{reason: '비밀번호가 틀렸습니다.'});
        }catch(error){
            console.error(error);
            return done(error);
        }


    }
    ));
}