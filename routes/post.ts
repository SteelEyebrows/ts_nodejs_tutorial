import * as express from 'express';
import Post from '../models/post';
import * as multer from 'multer';
import * as multerS3 from 'multer-s3';
import * as AWS from 'aws-sdk';
import {isLoggedIn} from './middleware';
import * as path from 'path';
import Hashtag from '../models/hashtag';
import Image from '../models/image';
import * as BlueBird from 'bluebird';
import User from '../models/user';


const router = express.Router();

AWS.config.update({
    region:'ap-northeast-2',
    accessKeyId:process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
});

const upload = multer({
    storage:multerS3({
        s3:new AWS.S3(),
        bucket:'react-nodebird',
        key(req,file,cb){
            cb(null,`original/${+new Date()}${path.basename(file.originalname)}`);
        }
    }),
    limits:{fileSize:20*1024*1024},
});

router.post('/',isLoggedIn,upload.none(),async(req,res,next)=>{
    try {
        const hashtags:string[] = req.body.content.match(/#[^\s]+/g);
        const newPost = await Post.create({
            content:req.body.content,
            UserId:req.user!.id
        });
        if(hashtags){
            const promises = hashtags.map((tag)=>Hashtag.findOrCreate({
                where:{name:tag.slice(1).toLowerCase()}
            }));
            const result = await Promise.all(promises);
            await newPost.addHashtags(result.map((r)=>r[0]));
        }
        if(req.body.image){
            if(Array.isArray(req.body.image)){
                const promises:BlueBird<Image>[] = req.body.image.map((image:string)=>Image.create({src:image}));
                //타입이 원래는 promise지만 sequelize의 경우 bluebird사용
                const images = await Promise.all(promises);
                await newPost.addImages(images);
            }else{
                const image = await Image.create({src:req.body.image});
                await newPost.addImage(image);
            }

            const fullPost = await Post.findOne({
                where:{id:newPost.id},
                include:[{
                    model:User,
                    attributes:['id','nickname']
                },{
                    model:Image
                },{
                    model:User,
                    as:'Likers',
                    attributes:['id'],
                }],
            });
            return res.json(fullPost);
        }
    } catch (error) {
        console.log(error);
        return next(error);
    }
});

router.post('/image',upload.array('image'),(req,res,next)=>{
    if(Array.isArray(req.files)){
        res.json((req.files as Express.MulterS3.File[]).map(v=>v.location));
    }
})

export default router;


// {
//     "api": { 
//       "invokeUrl": "https://5bltcq602h.execute-api.us-west-2.amazonaws.com/prod"
//     } ,
//     "cognito":{
//       "REGION":"ap-northeast-2",
//       "USER_POOL_ID":"ap-northeast-2_O6h5CbYvt",
//       "APP_CLIENT_ID":"qolqi2gi7svqi7p7dchsltq10"
//     },
//     "S3":{
//       "bucketName": "wowproject-wow",
//       "dirName":"demo",
//       "region": "ap-northeast-2",
//       "accessKeyId": "AKIAIRRU47F5VG7TAUYA",
//       "secretAccessKey": "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"
//     }
//   }
  