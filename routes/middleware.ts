import {Request,Response,NextFunction} from 'express';

const isLoggedIn = (req:Request,res:Response,next:NextFunction)=>{
    if(req.isAuthenticated()){
        next();
    }else{
        res.status(401).send('로그인이 필요합니다');
    }
}; //로그인했는지

const isNotLoggedIn = (req:Request,res:Response,next:NextFunction)=>{
    if(!req.isAuthenticated()){
        next();
    }else{
        res.status(401).send('로그인한 사용자는 접근할 수 없습니다.');
    }
}; //로그인 안했는지

export {isLoggedIn,isNotLoggedIn}; //./user.ts에 삽입