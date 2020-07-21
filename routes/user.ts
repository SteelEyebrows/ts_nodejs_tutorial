import * as express from 'express';
import User from '../models/user';
import {isLoggedIn, isNotLoggedIn} from './middleware';
import * as bcrypt from 'bcrypt';
import passport = require('passport');
import Post from '../models/post';
import Image from '../models/image';


const router = express.Router();

//get == 읽거나 검색
router.get('/',isLoggedIn,(req,res)=>{//isLoggedIn 되어야 통과 => req.user 반드시 존재 =>!붙여줌

    const user = (req.user!.toJSON() as User); 
    // const user = req.user.toJSON(); 
    //node_modules/passport/index.d.ts 에 있는 user를 바라보고 있기때문에 오류
    //내가 만든 타입을 바라보도록 우선순위를 조정해야함 => types/express.d.ts 만듬

    delete user.password;//toJson 타이핑을 확인하면 그냥 Object임, password의 존재 확신x => user를 강제 형변환
    //내정보가져올때 패스워드 제거하고 가져옴

    return res.json(user);
}); //사용자 정보 가져오는 라우터

//post == 리소스생성
router.post('/',async(req,res,next)=>{//사용자 정보 등록하는 라우터(회원가입)
    try{
        const exUser = await User.findOne({ //이전에 사용자 있는지
            where:{
                userId:req.body.userId,
            }
        })
        if(exUser){
            return res.status(403).send('이미 사용중인 아이디입니다.')
        }
        const hashedPassword = await bcrypt.hash(req.body.password,12);//암호화하는데 1초이상 걸리면 해킹의 가성비가 떨어지기 때문에 해킹하지 않는다.
        //공식문서를 보면 promise를 리턴하기 때문에 비동기(await)을 사용
        const newUser = await User.create({
            nickname:req.body.nickname,
            userId:req.body.userId,
            password: hashedPassword,
        });
        return res.status(200).json(newUser);
    }catch(err){
        console.log(err);
        return next(err);
    }
})

router.post('./login',isNotLoggedIn,(req,res,next)=>{
    //로그인! 
    passport.authenticate('local',(err:Error,user:User,info:{message:string})=>{ //타이핑이 any로 되어있는 경우 내가 직접 타이핑
        if(err){
            console.log(err);
            return next(err);
        }
        if(info){
            return res.status(401).send(info.message);
        }
        return req.login(user,async(loginError:Error)=>{
            try{
                if(loginError){
                    return next(loginError)
                }
                const fullUser = await User.findOne({
                    where:{id:user.id},
                    include:[{
                        model:Post,
                        as:'Posts',
                        attributes:['id'],
                    },{
                        model:User,
                        as:'Followings',
                        attributes:['id']
                    },{
                        model:User,
                        as:'Followers',
                        attributes:['id']
                    }],
                    attributes:{
                        exclude:['password']
                    }//로그인할때 패스워드 뺴고 내정보 전부 프론트로 보냄
                });
                return
            }catch(e){
                console.log(e);
                return next(e);
            }
        });
    })(req,res,next);
});

router.post('/logout',isLoggedIn,(req,res)=>{
    req.logout();
    req.session?.destroy(()=>{

    });
    res.send('logout 성공')
})

export interface IUser extends User{ //여러곳에서 사용할 수 있도록 export
    PostCount:number;
    FollowingCount:number;
    FollowerCount:number;
}
router.get('./:id',async(req,res,next)=>{
    try{
        const user = await User.findOne({
            where:{id:parseInt(req.params.id,10)},
            include:[{
                model:Post,
                as:'Posts',
                attributes:['id'],
            },{
                model:User,
                as:'Followings',
                attributes:['id']
            },{
                model:User,
                as:'Followers',
                attributes:['id']
            }],
            attributes:{
                exclude:['id','nickname']
            }
        });
        if(!user){
            return res.status(404).send('그런유저 없다')
        }
        const jsonUser = user.toJSON() as IUser;
        jsonUser.PostCount = jsonUser.Posts? jsonUser.Posts.length:0;
        jsonUser.FollowingCount = jsonUser.Followings!.length;
        jsonUser.FollowerCount = jsonUser.Followers!.length;

        return res.json(jsonUser);
    }catch(err){
        console.error(err);
        return next(err);
    }
})//특정사용자 정보 가져오는 라우터

router.get('/:id/followings',isLoggedIn,async(req,res,next)=>{
    try {
        const user = await User.findOne({
            where:{id:parseInt(req.params.id,10)||(req.user&& req.user.id)||0},
        });//팔로잉하고 있는 목록 불러옴
        if(!user) return res.status(404).send('유저없음')
        const followings = await user.getFollowings({
            attributes:['id','nickname'], //팔로잉한 사람 아이디와 닉네임 가져옴
            limit: parseInt(`${req.query.limit}`,10),
            offset: parseInt(`${req.query.offset}`,10)
        })
        return res.json(followings);
    } catch (e) {
        console.error(e);
        return next(e);
    }
})

router.delete('/:id/follower',isLoggedIn,async(req,res,next)=>{//팔로워 제거
    try {
        const me = await User.findOne({
            where:{id:req.user!.id}
        })
        await me!.removeFollower(parseInt(req.params.id,10))
        res.send(req.params.id);
    } catch (e) {
        console.error(e);
        next(e)
    }
});

router.post('/:id/follow',isLoggedIn,async(req,res,next)=>{
    try{
        const me = await User.findOne({
            where:{id:req.user!.id}
        });
    await me!.removeFollower(parseInt(req.params.id,10))
        res.send(req.params.id);
    }catch(e){
        console.error(e);
        next(e)
    }
});

router.post('/:id/posts',isLoggedIn,async(req,res,next)=>{
    try{
        const posts = await User.findAll({
            where:{
                Userid:parseInt(req.params.id,10)||(req.user && req.user.id)||0,
                RetweetId:null,
            
        },
            include:[{
                model:User,
                attributes:['id','nickname']
            },{
               model:Image
            },{
                model:User,
                as:'Liker',
                attributes:['id']
            }]
        });
        res.json(posts);
    }catch(e){
        console.error(e);
        next(e)
    }
});

router.patch('/nickname',isLoggedIn,async(req,res,next)=>{
    try{
        await User.update({
            nickname:req.body.nickname
        },{
            where:{id:req.user!.id}
        });
        res.send(req.body.nickname)
    }catch(e){
        console.error(e);
        next(e)
    }
})

export default router;