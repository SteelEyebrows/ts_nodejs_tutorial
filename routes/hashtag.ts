// import * as express from 'express';
// import * as Sequelize from 'sequelize';
// const router = express.Router();

// router.get('/:tag', async(req,res,next)=>{
//     try {
//         let where ={};
//         if(req.query.lastId){
//             where = {
//                 id:{
//                     [Sequelize.0p.lt]: parseInt(req.query.lastId,10),
//                 }
//             }
//         }
//     } catch (e) {
//         console.log(e)
//         return next(e);
//     }
// })