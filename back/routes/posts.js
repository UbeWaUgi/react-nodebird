const express = require('express');
const { Post, User, Image, Comment, Sequelize } = require('../models');
const router = express.Router();
const {Op} = require('sequelize');
const {isLoggedIn} = require('./middlewares');

router.get('/', async(req,res,next) => { // GET /posts
    try {
        const where = {};
        if(parseInt(req.query.lastId, 10)) { //초기로딩이 아닐때
            
            where.id = {[Op.lt]: parseInt(req.query.lastId, 10)} //보다 작은을 뜻한 [Op.lt]

        } //21 20 19 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1

        const posts = await Post.findAll({
            where, //lastId보다 작은
            limit: 10, //10개만 가져와...!
            //offset: 0, // 1~10 게시물 까지 가져와 , offset: 10 --> 11~20 게시물까지 가져와
            order: [['createdAt', 'DESC'],
            [Comment, 'createdAt', 'DESC']
        ],
            include: [{
                model: User,
                attributes:   {
                    exclude: ['password']
                },
            },
            {
                model: Image,
            },
            {
                model: Comment,
                include: [{
                    model:User,
                    attributes: {
                        exclude: ['password']
                    },
                }]
            },
            {
                model: User, // 좋아요 누른사람
                as: 'Likers',
                attributes : ['id'],
            },
            {
                model: Post,
                as : 'Retweet',
                include: [{
                    model: User,
                    attributes: ['id', 'nickname'],
                },
                {
                    model: Image,
                }
            ],
            }
        ]
        })
       // console.log(posts);
        res.status(200).json(posts);
    }catch (error) {
        console.error(error);
        next(error);
    }

 
});


router.get('/datePosts', async(req,res,next) => { // GET /posts
    try {
        const where = {};
        if(parseInt(req.query.lastId, 10)) { //초기로딩이 아닐때
            
            where.id = {[Op.lt]: parseInt(req.query.lastId, 10)} //보다 작은을 뜻한 [Op.lt]

        } //21 20 19 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1

        if(req.query.date) {
            console.log('date where success');
            const selectDate = new Date(req.query.date);
            const tomorrow = new Date(req.query.date);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            console.log(selectDate);
            console.log(tomorrow);
            where.updatedAt = {[Op.gte] : selectDate,
            [Op.lt] : tomorrow
            }
        }
        console.log(req.query.date);
        
        console.log(where);
        const posts = await Post.findAll({
            where, //lastId보다 작은
            limit: 10, //10개만 가져와...!
            //offset: 0, // 1~10 게시물 까지 가져와 , offset: 10 --> 11~20 게시물까지 가져와
            order: [['createdAt', 'DESC'],
            [Comment, 'createdAt', 'DESC']
        ],
            include: [{
                model: User,
                attributes:   {
                    exclude: ['password']
                },
            },
            {
                model: Image,
            },
            {
                model: Comment,
                include: [{
                    model:User,
                    attributes: {
                        exclude: ['password']
                    },
                }]
            },
            {
                model: User, // 좋아요 누른사람
                as: 'Likers',
                attributes : ['id'],
            },
            {
                model: Post,
                as : 'Retweet',
                include: [{
                    model: User,
                    attributes: ['id', 'nickname'],
                },
                {
                    model: Image,
                }
            ],
            }
        ]
        })
       // console.log(posts);
        res.status(200).json(posts);
    }catch (error) {
        console.error(error);
        next(error);
    }

 
});

router.get('/related', isLoggedIn, async(req,res,next) => {
    try {
        const followings = await User.findAll({
            attributes: ['id'],
            include:[{
                model:User,
                as: 'Followers',
                where: {id: req.user.id}
            }]
        })
        //여기한번.
        
        const where = { 
            UserId: {[Op.in]: followings.map((v) => v.id)} // UserId: {[Op.in]: [Sequelize.literal('Select id from') ]} 이런식으로 여기에 팔로이한 유저만 가지고 와서
            //할수 있음 서브쿼리를 이용...! 일단은 다른 방식으로..!
        };
        
        if(parseInt(req.query.lastId, 10)) { //초기로딩이 아닐때
            
            where.id = {[Op.lt]: parseInt(req.query.lastId, 10)} //보다 작은을 뜻한 [Op.lt]

        } //21 20 19 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1

        //여기한번 총 쿼리두번인데 서브쿼리이용해서 한번에 가지고올수 있도록 해보자..!

        const posts = await Post.findAll({
            where, //lastId보다 작은
            limit: 10, //10개만 가져와...!
            //offset: 0, // 1~10 게시물 까지 가져와 , offset: 10 --> 11~20 게시물까지 가져와
            order: [['createdAt', 'DESC'],
            [Comment, 'createdAt', 'DESC']
        ],
            include: [{
                model: User,
                attributes:   {
                    exclude: ['password']
                },
            },
            {
                model: Image,
            },
            {
                model: Comment,
                include: [{
                    model:User,
                    attributes: {
                        exclude: ['password']
                    },
                }]
            },
            {
                model: User, // 좋아요 누른사람
                as: 'Likers',
                attributes : ['id'],
            },
            {
                model: Post,
                as : 'Retweet',
                include: [{
                    model: User,
                    attributes: ['id', 'nickname'],
                },
                {
                    model: Image,
                }
            ],
            }
        ]
        })
       // console.log(posts);
        res.status(200).json(posts);
    }catch (error) {
        console.error(error);
        next(error);
    }

});


router.get('/unrelated', isLoggedIn, async(req,res,next) => {
    try {

        const followings = await User.findAll({
            attributes: ['id'],
            include:[{
                model:User,
                as: 'Followers',
                where: {id: req.user.id}
            }]
        })

        const where = {
            UserId: {[Op.notIn] : followings.map((v) => v.id).concat(req.user.id)}
        };
        if(parseInt(req.query.lastId, 10)) { //초기로딩이 아닐때
            
            where.id = {[Op.lt]: parseInt(req.query.lastId, 10)} //보다 작은을 뜻한 [Op.lt]

        } //21 20 19 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1
        const posts = await Post.findAll({
            where, //lastId보다 작은
            limit: 50, //10개만 가져와...!
            //offset: 0, // 1~10 게시물 까지 가져와 , offset: 10 --> 11~20 게시물까지 가져와
            order: [['createdAt', 'DESC'],
            [Comment, 'createdAt', 'DESC']
        ],
            include: [{
                model: User,
                attributes:   {
                    exclude: ['password']
                },
            },
            {
                model: Image,
            },
            {
                model: Comment,
                include: [{
                    model:User,
                    attributes: {
                        exclude: ['password']
                    },
                }]
            },
            {
                model: User, // 좋아요 누른사람
                as: 'Likers',
                attributes : ['id'],
            },
            {
                model: Post,
                as : 'Retweet',
                include: [{
                    model: User,
                    attributes: ['id', 'nickname'],
                },
                {
                    model: Image,
                }
            ],
            }
        ]
        })
       // console.log(posts);
        res.status(200).json(posts);
    }catch (error) {
        console.error(error);
        next(error);
    }

});

module.exports = router;