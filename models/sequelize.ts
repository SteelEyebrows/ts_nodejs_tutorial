//순환참조를 없애기 위해 만듬 1:14:00

import {Sequelize} from 'sequelize'; //Sequence 는class, sequence는 인스턴스
import config from '../config/config';

const env = process.env.NODE_ENV as ('production'|'test'|'development') || 'development';
const {database, username, password} = config[env];
const sequelize = new Sequelize(database, username, password,config[env]);

export {sequelize};
export default sequelize;