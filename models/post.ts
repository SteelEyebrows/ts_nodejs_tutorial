import {Model, DataTypes, BelongsToManyAddAssociationsMixin, HasManyAddAssociationsMixin,HasManyAddAssociationMixin} from 'sequelize';
import {sequelize} from './sequelize';
import {dbType} from './index';
import Hashtag from './hashtag';
import Image from './image';

class Post extends Model {
    public readonly id!:number;
    public content !: string;
    public readonly createdAt !:Date;
    public readonly updatedAt !:Date;

    public addHashtags!:BelongsToManyAddAssociationsMixin<Hashtag,number>; //맨아래 관계를 보면 헤쉬태그는 BelongsToMany
    public addImages !: HasManyAddAssociationsMixin<Image,number>;
    public addImage !: HasManyAddAssociationMixin<Image,number>;

}

Post.init({
    content:{
        type:DataTypes.TEXT,
        allowNull:false,
    }
},{
    sequelize,
    modelName:'Post',
    tableName:'post',
    charset:'utf8mb4',
    collate:'utf8mb4_general_ci'

});

export const associate = (db:dbType) =>{
    db.Post.belongsTo(db.User);//게시글은 작성한 유저가 있을거고
    db.Post.hasMany(db.Comment);//댓글여러개 있을거고
    db.Post.hasMany(db.Image);//이미지 여러개 가지고 있을거고
    db.Post.belongsTo(db.Post,{as:'Retweet'});//리트윗이 될수 있고
    db.Post.belongsToMany(db.Hashtag,{through:'PostHashtag'});//해쉬태그랑 비롱스투매니 관계
    db.Post.belongsToMany(db.User,{through:'Like',as:'Likers'});//내가 좋아요한 게시글
}

export default Post;