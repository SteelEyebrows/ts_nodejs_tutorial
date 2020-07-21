import {Model, DataTypes,BelongsToManyAddAssociationsMixin, BelongsToManyGetAssociationsMixin, HasManyGetAssociationsMixin,BelongsToManyRemoveAssociationMixin, BelongsToManyGetAssociationsMixinOptions} from 'sequelize';
import {dbType} from './index';
import {sequelize} from './sequelize';
import Post from './post';

class User extends Model{ //타입선언의 역할도 함
    // req.body.~
    public id!:number;
    public nickname!:string;
    public userId!:string;
    public password!:string;
    public readonly createdAt!: Date; //자체적으로 관리해주기 때문에 우리가 직접 설정하지 않음 => readonly
    public readonly updatedAt!:Date

    public readonly Posts?:Post[];
    public readonly Followers?:User[];
    public readonly Followings?:User[];

    public getPost!:HasManyGetAssociationsMixin<Post>
    public addFollowing!:BelongsToManyAddAssociationsMixin<User, number>
    public getFollowings!:BelongsToManyGetAssociationsMixin<User>;
    public removeFollowing!:BelongsToManyRemoveAssociationMixin<User,number>;//유저의 아이디의 타입
    public getFollowers!:BelongsToManyGetAssociationsMixin<User>;
    public removeFollower!:BelongsToManyRemoveAssociationMixin<User,number>;//유저의 아이디의 타입
}

User.init({
    nickname:{
        type:DataTypes.STRING(20),
    },
    userId:{
        type:DataTypes.STRING(20),
        allowNull:false,
        unique:true,
    },
    password:{
        type:DataTypes.STRING(100),
        allowNull:false
    }

},{
    sequelize,
    modelName:'User',
    tableName:'user',
    charset:'utf8',
    collate:'utf8_general_ci'
})

//관계설정
export const associate=(db:dbType)=>{
db.User.hasMany(db.Post,{as:'Posts'});
db.User.hasMany(db.Comment); //사용자는 댓글을 여러개 쓸수 있음
db.User.belongsToMany(db.Post,{through:'Like',as:'Liked'})//좋아요를 여러개 누를수 있음 User.get('Liked')
db.User.belongsToMany(db.Post,{through:"Follow",as:'Followers',foreignKey:'followingId'}) //as랑 foreingKey가 가르키는건 반대
db.User.belongsToMany(db.Post,{through:"Follow",as:'Followings',foreignKey:'followerId'})
}

export default User;