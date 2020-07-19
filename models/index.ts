
import User,{associate as associateUser} from './user';
export * from './sequelize';
const db ={ //모델들 넣어둠
  User
};
export type dbType = typeof db;
associateUser(db);