const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { Post, Image, Comment, User, Hashtag } = require('../models');
const {isLoggedIn} = require('./middlewares');
const fs = require('fs');
const multerS3 = require('multer-s3');
const AWS= require('aws-sdk');


try{
    fs.accessSync('uploads');
}catch(error){
    console.log('uploads 폴더가 없으므로 생성합니다.');
    fs.mkdirSync('uploads');
}

AWS.config.update({
    accessKeyId:process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: 'ap-northeast-2',
})


const upload = multer({
    storage: multerS3({
        s3: new AWS.S3(), //s3권한을 얻는다.
        bucket: 'ubewaugi-s3',
        key(req, file, cb) { //저장되는 파일 이름.
            cb(null, `original/${Date.now()}_${path.basename(file.originalname)}`)
        },
    }),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  });

/*
서버 로컬을 사용하는 방법.
const upload = multer({
    storage: multer.diskStorage({
      destination(req, file, done) {
        done(null, 'uploads');
      },
      filename(req, file, done) { // 제로초.png
        const ext = path.extname(file.originalname); // 확장자 추출(.png)
        //console.log(ext);
        const basename = path.basename(file.originalname, ext); // 제로초
        //console.log(basename);
        done(null, basename + '_' + new Date().getTime() + ext); // 제로초15184712891.png
      },
    }),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  });
*/
router.post('/', isLoggedIn, upload.none(), async(req,res, next) => {
    try{
       const post = await Post.create({
            content: req.body.content,
            UserId: req.user.id, //로그인후 이제 라우터 접근하게되면 deserialize를 실행하게되고
            //그 기반을 통해 req.user를 만들고 그래서 req.user에 접근 할 수 있음.
        });

        if(req.body.image){
            //이미지가 여러개인경우에는 image: [1.png, 2.png] 처럼 배열로오고,
            if(Array.isArray(req.body.image)){
              const images =  await Promise.all(req.body.image.map((image) => Image.create({src: image})));
                await post.addImages(images);
            }else { //이미지가 하나인경우에는 image : 1.png 이런식으로옴
                const image = await Image.create({src: req.body.image});
                await post.addImages(image);
            }
        }

        const hashtags = req.body.content.match(/(#[^\s#]+)/g);

        if(hashtags) {
            const result = await Promise.all(hashtags.map((tag) => Hashtag.findOrCreate({where :{name: tag.slice(1).toLowerCase()}})))
        
        // [[노드, true], [리액트 , true]]

        console.log(result);
        await post.addHashtags(result.map((v) => v[0])) //이렇게하는 이유는
        //위처럼 데이터가 결과가 나오기 때문,
    } 
        const fullPost = await Post.findOne({
            where : { id: post.id },
            include: [{
                model : Image,
            },
            {
                model: Comment,
                include: [{
                    model: User,
                    exclude: ['password']
                }]
            },
            {
                model: User, //게시글 작성자
                attributes: {
                    exclude: ['password']
                },
            },
            {
                model: User, // 좋아요 누른사람
                as: 'Likers',
                attributes : ['id'],
            }
        ]
        })

        res.status(201).json(fullPost);
    }catch(error) {
        console.error(error);
        next(error);
    }
});


router.get('/:postId', async(req,res, next) => {
    try{
        const post = await Post.findOne({
            where: {id: req.params.postId},
            include: [{
                model: Post,
                as:'Retweet',
            }]
        })

        if(!post){
            return res.status(404).send('존재하지 않는 게시글입니다.');
        }


        const fullPost = await Post.findOne({
            where:{id:post.id},
            include: [{
                model:Post,
                as:'Retweet',
                include: [{
                    model:User,
                    attributes:['id', 'nickname'],
                },
                {
                    model:Image,
                }
                ]},
            {
                model:User,
                attributes: ['id', 'nickname'],
            },
            {
                model: Image,
            },
            {
                model:Comment,
                include:[{
                    model:User,
                    attributes:['id', 'nickname']
                }]
            },
            {
                model:User,
                as:'Likers',
                attributes:['id'],
            }
            ]
        })

        res.status(200).json(fullPost);
    }catch(error) {
        console.error(error);
        next(error);
    }
});

router.post('/:postId/comment', isLoggedIn, async(req,res, next) => {
    try{
        const post = await Post.findOne({
            where: {id: req.params.postId}
        })

        if(!post){
            return res.status(403).send('존재하지 않는 게시글입니다.');
        }

        const comment = await Comment.create( {
            content: req.body.content,
            PostId: parseInt(req.params.postId), //주소의 파람을 접근하는 방법.
            UserId: req.user.id,
        })

        const fullComment = await Comment.findOne({
            where : {id: comment.id},
            include: [{
                model:User,
                attributes: {
                    exclude : ['password'],
                }
            }]
        })

        res.status(201).json(fullComment);
    }catch(error) {
        console.error(error);
        next(error);
    }
});

router.patch('/:postId/like',isLoggedIn,  async(req, res, next) => { // PATCH /post/1/like
    try{
        const post = await Post.findOne({
            where: {id : req.params.postId}
        });

        if(!post){
            return res.status(403).send('게시글이 존재하지 않습니다.');
        }

        await post.addLikers(req.user.id);
        res.json({PostId : parseInt(req.params.postId), UserId : req.user.id });

    }catch(error){
        console.error(error);
        next(error);
    }
    

});


router.delete('/:postId/like',isLoggedIn, async(req, res, next) => { // DELETE /post/1/like
    try{
        const post = await Post.findOne({
            where: {id : req.params.postId}
        });

        if(!post){
            return res.status(403).send('게시글이 존재하지 않습니다.');
        }

        await post.removeLikers(req.user.id);
        res.json({PostId : parseInt(req.params.postId), UserId : req.user.id });

    }catch(error){
        console.error(error);
        next(error);
    }
});

router.delete('/:postId',isLoggedIn, async(req,res, next) => { // DELETE /post/10
    try{

        await Post.destroy({where:
             {
                 id: req.params.postId,
                 UserId: req.user.id,
        }})

        res.status(200).json({PostId: parseInt(req.params.postId)});
    }catch(error) {
        console.error(error);
        next(error);
    }
});



  router.post('/images', isLoggedIn, upload.array('image'), (req, res, next) => { // POST /post/images
    console.log(req.files);
    //res.json(req.files.map((v) => v.filename)); 로컬 서버 내부에 저장할때
    res.json(req.files.map((v) => v.location.replace(/\/original\//, '/thumb/'))); //s3에 저장할때
  });



  router.post('/:postId/retweet', isLoggedIn, async(req,res, next) => {
    try{
        const post = await Post.findOne({
            where: {id: req.params.postId},
            include: [{
                model: Post,
                as:'Retweet',
            }]
        })

        if(!post){
            return res.status(403).send('존재하지 않는 게시글입니다.');
        }

        if(req.user.id === post.UserId || (post.Retweet && post.Retweet.UserId === req.user.id)){
            return res.status(403).send('자신의 글은 리트윗할 수 없습니다.')
        } //그글이 내가 쓴글이거나, 그 글의 리트윗 본체글이 내가 쓴글이면,

        const retweetTargetId = post.RetweetId || post.id
        //해당 글의 리트윗아이디가 있으면, 그 리트윗아이디가 본체이므로 그 리트윗 아이디를 리트윗
        //없으면 글의 id를 리트윗

        const exPost = await Post.findOne({
            where:{
                UserId:req.user.id,
                RetweetId: retweetTargetId, 
            }
        })// 내가 리트윗한 게시글이 있는데 그 게시글을 찾는것
        //왜냐하면 리트윗한 글을 한번더 리트윗하면 안되니까.

        if(exPost) {
            return res.status(403).send('이미 리트윗 했습니다.');
        }

        const retweet = await Post.create({
            UserId: req.user.id,
            RetweetId : retweetTargetId,
            content: 'retweet',
        });

        const retweetWithPrevPost = await Post.findOne({
            where:{id:retweet.id},
            include: [{
                model:Post,
                as:'Retweet',
                include: [{
                    model:User,
                    attributes:['id', 'nickname'],
                },
                {
                    model:Image,
                }
                ]},
            {
                model:User,
                attributes: ['id', 'nickname'],
            },
            {
                model: Image,
            },
            {
                model:Comment,
                include:[{
                    model:User,
                    attributes:['id', 'nickname']
                }]
            },
            {
                model:User,
                as:'Likers',
                attributes:['id'],
            }
            ]
        })

        res.status(201).json(retweetWithPrevPost);
    }catch(error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;  