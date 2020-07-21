//passport 는 express에 덧붙여서 만들어진것 

import * as passport from 'passport';
import User from '../models/user'
import local from './local';

export default ()=>{
    passport.serializeUser<User,number>((user,done)=>{//serializeUser 공식문서를 보면 제네릭으로 되어있기 때문에 직접 타입넣음
        done(null,user.id) //로그인할떄 유저정보를 메모리에 저장
    });//로그인할때만 실행
    
    passport.deserializeUser<User,number>(async(id,done)=>{
        try{
            const user = await User.findOne({
                where:{id}
            });//사용자아이디를 사용자객체로 바꿔놓는 함수
            if(!user){
                return done(new Error('NO USER'));
            }
            return done(null,user);//req.user이 됨
        } catch(err){
            console.log(done(err));
        }
    })//매번실행

    local();
}