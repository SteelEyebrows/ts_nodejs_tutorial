//보통 타입은 node_modules/@types에 있음 
// sequelize 같은 경우는 자체적으로 타이핑이 되어있음, 이경우 package.json에 "types":"types"라고 적혀있음

import User from '../models/user';

declare namespace Express{
    export interface Request{
        user?:User;
    }
}