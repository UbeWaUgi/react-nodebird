const express = require('express');
const { Post, User, Image, Comment } = require('../models');
const router = express.Router();
const {Op} = require('sequelize');

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

module.exports = router;