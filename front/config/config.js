export const backUrl = process.env.NODE_ENV === 'production' ? 'https://api.ubewaugi.com' : 'http://localhost:3065';

// 이렇게해도 웹 접속시 앞에 붙은것에 따라 붙게된다.
// https면 https, http면 http가 자동으로 붙는다.
// 단 서버사이드스크립트 는 채워서 가지않고 //api 이런식으로 날라가고
// 화면단에서 우리가 로그인 이런것처럼 날라갈때는 채워져서 날라감.
