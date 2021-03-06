import * as express from 'express'; // * as 안붙이려면 export default해야함/ require 이랑 차이점 
import * as morgan from 'morgan';
import * as cors from 'cors';
import * as cookieParser from 'cookie-parser';
import * as expressSession from 'express-session';
import * as dotenv from 'dotenv';
import * as passport from 'passport';
import * as hpp from 'hpp';
import * as helmet from 'helmet';
import {Application,Request, Response,NextFunction} from 'express';

import {sequelize} from './models';
import userRouter from './routes/user';
import postRouter from './routes/post';

const app:Application = express();
const prod:boolean = process.env.NODE_ENV ==='production'; //개발용이면 port 3065

app.set('port',prod?process.env.PORT:3065); // express 내의 변수를 설정
sequelize.sync({force:false}) // force true면 시작할때마다 테이블 초기화
    .then(()=>{
        console.log('데이터베이스 연결성공')
    }).catch((err:Error)=>{
        console.log(err)
    });
//미들웨어
if(prod){
    app.use(hpp());
    app.use(helmet());
    app.use(morgan('combined'));
    app.use(cors({
        origin:/nodebird\.com$/,
        credentials:true,
    }))
}else{
    app.use(morgan('dev'));
    app.use(cors({
        origin:true,
        credentials:true
    }))
}

app.use('/',express.static('uploads'));//정적인문서 집어넣는곳
app.use(express.json());
app.use(express.urlencoded({extended:true}));//객체 안에 객체를 파싱할 수 있게하려면 true.
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(expressSession({
    resave:false,
    saveUninitialized:false,
    secret:process.env.COOKIE_SECRET!,
    cookie:{
        httpOnly:true,
        secure:false, // https->true
        domain:prod?'.nodebird.com':undefined,
    },
    name:'rnbck'
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/user',userRouter);
app.use('/post',postRouter);
//

app.get('/',(req:Request,res:Response,next:NextFunction)=>{
    res.send('success');
});

app.listen(app.get('port'),()=>{
    console.log('success')
});


