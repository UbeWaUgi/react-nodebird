const express = require('express');
const {Op} = require('sequelize');
const bcrypt = require('bcrypt');
const {User, Post, Image, Comment} = require('../models');
const router = express.Router();
const passport = require('passport');
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');


//새로고침만하면 이요청이간다?
router.get('/', async (req,res,next) =>{ // GET /user
    console.log(req.headers);
    try {
        if(req.user) {
            
            const fullUserWithoutPassword = await User.findOne({
                where: {id: req.user.id},
                attributes: {
                    exclude: ['password']
                },
                include: [{
                    model : Post,
                    attributes: ['id'],
                },
                {
                    model: User,
                    as: 'Followings',
                    attributes: ['id'],

                },
                {
                    model: User,
                    as: 'Followers',
                    attributes: ['id'],
                }
            ]
            });
            res.status(200).json(fullUserWithoutPassword);
        }else{
            res.status(200).json(null);
        }
    }catch(error){
        console.error(error);
        next(error);
    }
});



//사용자에대한 게시물
router.get('/:id/posts', async (req, res, next) => { // GET /user/1/posts
    try {
      
        const where = {UserId: req.params.id};
        if (parseInt(req.query.lastId, 10)) { // 초기 로딩이 아닐 때
          where.id = { [Op.lt]: parseInt(req.query.lastId, 10)}
        } // 21 20 19 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1
        const posts = await Post.findAll({
          where,
          limit: 10,
          order: [['createdAt', 'DESC']],
          include: [{
            model: Image,
          }, {
            model: Comment,
            include: [{
              model: User,
              attributes: ['id', 'nickname'],
            }]
          }, {
            model: User,
            attributes: ['id', 'nickname'],
          }, {
            model: User,
            through: 'Like',
            as: 'Likers',
            attributes: ['id'],
          }, {
            model: Post,
            as: 'Retweet',
            include: [{
              model: User,
              attributes: ['id', 'nickname'],
            }, {
              model: Image,
            }]
          }],
        });
        console.log(posts);
        res.status(200).json(posts);

    } catch (error) {
      console.error(error);
      next(error);
    }
  });

router.post('/login', isNotLoggedIn, (req,res,next) => {
    passport.authenticate('local', (err, user, info) => {
        if(err) {
            console.error(err);
            return next(err); //500
        }
        if(info) {
            return res.status(403).send(info.reason);
        }
        if(user) {
            return req.login(user, async(loginErr) => {
                if(loginErr) {
                    console.error(loginErr);
                    return next(loginErr);
                }
                // res.setHeader('Cookie', 'cxlhy')
                const fullUserWithoutPassword = await User.findOne({
                    where: {id: user.id},
                    attributes: {
                        exclude: ['password']
                    },
                    include: [{
                        model : Post,
                    },
                    {
                        model: User,
                        as: 'Followings',

                    },
                    {
                        model: User,
                        as: 'Followers',
                    }
                ]
                })

                return res.json(fullUserWithoutPassword);
                //쿠키도같이날라감??
            })
        }
    })(req,res,next);
});
 // poast /user/login
//우리 로그인 전략이 이러면 실행됨.

router.post('/logout', isLoggedIn, (req,res) => {
    req.logout();
    req.session.destroy();
    res.send('ok');
});

router.post('/', isNotLoggedIn,async (req, res, next) => { // POST /user/
    try{
        exUser = await User.findOne({
            where : {
                email: req.body.email,
            }
        });
        if(exUser) {
            return res.status(403).send('이미 사용중인 아이디입니다.');
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 12);
        await User.create({
            email:req.body.email,
            nickname: req.body.nickname,
            password: hashedPassword,
        });
        //res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3060');
        //res.setHeader('Access-Control-Allow-Origin', '*');
        //두번째 인자는 두번째파라미터에서 오는 요청은 해당 헤더를 set 해주겠다
        res.status(200).send('ok');
        //async 함수 이고 그안에 await가 있다면 해당 await뒤에 실행된것이 이행상태가되면 그때 그뒤에것을 차례대로 실행하겠다
        //라는 의미임.
    }catch(error){
        console.error(error);
        next(error);
    }

}); 

router.patch('/nickname', isLoggedIn, async(req, res, next) => {
    try{
        await User.update({
            nickname: req.body.nickname,
        }, {
            where: {id: req.user.id},
        });

        res.status(200).json({nickname: req.body.nickname})
    }catch(error) {
        console.error(error);
        next(error);
    }
})

router.patch('/:userId/follow', isLoggedIn, async(req, res, next) => { // PATCH /user/1/follow
    try{
        const user = await User.findOne({where : {id : req.params.userId}});

        if(!user){
            res.status(403).send('없는 사람을 팔로우하려고 하시네요?');
        }

        await user.addFollowers(req.user.id);
        //내가 그사람의 팔로워가 되는거니까!!
        //addFollower로 그사람의 팔로워가 되는거임.

        res.status(200).json({UserId: parseInt(req.params.userId)})
    }catch(error) {
        console.error(error);
        next(error);
    }
})

router.delete('/:userId/follow', isLoggedIn, async(req, res, next) => { // DELETE /user/1/follow
    try{
        const user = await User.findOne({where : {id : req.params.userId}});

        if(!user){
            res.status(403).send('없는 사람을 팔로우하려고 하시네요?');
        }

        await user.removeFollowers(req.user.id);

        res.status(200).json({UserId: parseInt(req.params.userId)})
    }catch(error) {
        console.error(error);
        next(error);
    }
})

router.get('/followers', isLoggedIn, async(req, res, next) => { // PATCH /user/followers
    try{
        //get은 req.body로 받아오지않는다 그게 기본임
       
        const user = await User.findOne({ where: { id: req.user.id }});
        if (!user) {
          res.status(403).send('없는 사람을 찾으려고 하시네요?');
        }
        
        const followers = await user.getFollowers({
            attributes: {
                exclude: ['password']
            },
            limit: parseInt(req.query.limit, 10),
        });
        //내가 그사람의 팔로워가 되는거니까!!
        //addFollower로 그사람의 팔로워가 되는거임.

        res.status(200).json(followers);
    }catch(error) {
        console.error(error);
        next(error);
    }
})

router.get('/followings', isLoggedIn, async(req, res, next) => { // PATCH /user/followers
    try{
        const user = await User.findOne({ where: { id: req.user.id }});
        if (!user) {
          res.status(403).send('없는 사람을 찾으려고 하시네요?');
        }

        const followings = await user.getFollowings({
            attributes: {
                exclude: ['password']
            },
            limit: parseInt(req.query.limit, 10),
        });
        //내가 그사람의 팔로워가 되는거니까!!
        //addFollower로 그사람의 팔로워가 되는거임.

        res.status(200).json(followings);
    }catch(error) {
        console.error(error);
        next(error);
    }
})

router.delete('/follower/:userId', isLoggedIn, async(req, res, next) => { // DELETE /user/1/follow
    try{
        const user = await User.findOne({where : {id : req.params.userId}});

        if(!user){
            res.status(403).send('없는 사람을 차단하려고 하시네요?');
        }

        await user.removeFollowings(req.user.id);

        res.status(200).json({UserId: parseInt(req.params.userId, 10)})
    }catch(error) {
        console.error(error);
        next(error);
    }
})

//해당유저정보
router.get('/:id', async (req, res, next) => { // GET /user/3
    try {
      const fullUserWithoutPassword = await User.findOne({
        where: { id: req.params.id },
        attributes: {
          exclude: ['password']
        },
        include: [{
          model: Post,
          attributes: ['id'],
        }, {
          model: User,
          as: 'Followings',
          attributes: ['id'],
        }, {
          model: User,
          as: 'Followers',
          attributes: ['id'],
        }]
      })
      if (fullUserWithoutPassword) {
        const data = fullUserWithoutPassword.toJSON();
        data.Posts = data.Posts.length;
        data.Followings = data.Followings.length;
        data.Followers = data.Followers.length;
        res.status(200).json(data);
      } else {
        res.status(404).json('존재하지 않는 사용자입니다.');
      }
    } catch (error) {
      console.error(error);
      next(error);
    }
  });

module.exports = router;