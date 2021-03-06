const express = require('express');
const postRouter= require('./routes/post');
const postsRouter= require('./routes/posts');
const userRouter=require('./routes/user');
const hashtagRouter = require('./routes/hashtag');
const cors= require('cors');
const db = require('./models');
const passportConfig = require('./passport');
const { Http2ServerRequest } = require('http2');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport')
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const hpp = require('hpp');
const helmet = require('helmet');
dotenv.config();
const app = express();

if(process.env.NODE_ENV === 'production') {
    console.log("production server");
    app.set('trust proxy', 1); // nginx를이용해 리버스 프록시를 이용하니까 이 설정 추가
    app.use(morgan('combine'));
    app.use(hpp());
    app.use(helmet());
    app.use(cors({
        origin: ['https://ubewaugi.com', 'http://ubewaugi.com' ,'http://www.ubewaugi.com', 'https://www.ubewaugi.com'], //이부분이 이제 주소 거르는곳이긴한데,
        credentials: true, //이걸 해야 쿠키도 같이 전달해준다 다른 도메인 상에서.
        //도메인이 다르면 쿠키도 안보냄 원래 그럼 그래서 이 옵션을 사용.
    }));
}else {
    console.log("development server");
    app.use(morgan('dev'));
    app.use(cors({
        origin: true,
        credentials: true, //이걸 해야 쿠키도 같이 전달해준다 다른 도메인 상에서.
    }));
}


app.use('/', express.static(path.join(__dirname, 'uploads'))); // /경로가 localhost:3065/ 를 말함.
//즉 uploads 폴더까지를 그냥 /로 퉁치는것!

app.use(express.json());
app.use(express.urlencoded({extended:true})); //req.body?? 이런거 처리하려고 설정한것일듯.
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    saveUninitialized : false,
    resave: false,
    secret: process.env.COOKIE_SECRET,
    proxy: process.env.NODE_ENV === 'production',
    cookie: {
        httpOnly: true, //자바스크립트는 불가능하게, 변형되면 안되니
        secure: process.env.NODE_ENV === 'production', //ssl적용했으니 true
        domain: process.env.NODE_ENV === 'production' && '.ubewaugi.com' //api.ubewaugi 와 그냥 ubewaugi 사이 쿠키 공유가됨.
    }
})); // 세션을 위한 설정
app.use(passport.initialize()); // 세션을 위한 설정
app.use(passport.session()); // 세션을 위한 설정

db.sequelize.sync()
.then(() => {
  console.log('db 연결 성공');  
}).catch(console.error);

passportConfig();




app.get('/', (req,res) => {
    res.send('hello express');
});



app.use('/post', postRouter);
app.use('/posts', postsRouter);
app.use('/user', userRouter);
app.use('/hashtag', hashtagRouter);
/*
const server = http.createServer((req, res) => {
    console.log(req.url, req.method);
    res.write('<h1>Hello node1</h1>');
    res.write('<h2>Hello node2</h2>');
    res.write('<h3>Hello node3</h3>');
    res.write('<h4>Hello node4</h4>');
    res.end('<h5>Hello node5</h5>');
    
});
*/

app.use((err, req, res, next) => {
    
});

app.listen(3065, () => {
    console.log('서버 실행 중!!');
}); 


