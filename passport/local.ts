//로그인하는 부분

import * as passport from 'passport';
import {Strategy} from 'passport-local';
import * as bcrypt from 'bcrypt';
import User from '../models/user';
import { readdirSync } from 'fs';

export default ()=>{
    passport.use('local',new Strategy({
        usernameField:'userId',
        passwordField:'password'
    },async(userId,password,done)=>{
        try{
            const user = await User.findOne({where:{userId}});
            if(!user){
                return done(null, false, {message:'존재하지 않는 계정'})
            }
            const result = await bcrypt.compare(password,user.password);
            if(result){
                return done(null,user)
            }
            return done(null,false,{message:'비밀번호가 틀립니다.'})
        }catch(err){
            console.log(err);
        }
    }))
}