import {Model, DataTypes} from 'sequelize';
import {dbType} from './index';
import {sequelize} from './sequelize';

class User extends Model{
    public id!:number;
    public nickname!:string;
    public userId!:string;
    public password!:string;
    public readonly createdAt!: Date; //자체적으로 관리해주기 때문에 우리가 직접 설정하지 않음 => readonly
    public readonly updatedAt!:Date
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

}