
import User,{associate as associateUser} from './user';
import Comment,{associate as associateComment} from './user';
import Hashtag,{associate as associateHashtag} from './user';
import Image,{associate as associateImage} from './user';
import Post,{associate as associatePost} from './user';

export * from './sequelize';
const db ={ //모델들 넣어둠
  User,
  Comment,
  Hashtag,
  Image,
  Post
};
export type dbType = typeof db;

associateUser(db);
associateComment(db);
associateHashtag(db);
associateImage(db);
associatePost(db);