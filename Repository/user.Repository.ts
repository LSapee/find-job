import {prisma} from "./prismaDB";
const {getName,getEmail} = require("../auth/auth");

const createUser = async (token:string)=>{
    const name =await getName(token);
    const email =await getEmail(token);
    if(name!==null &&email!==null){
        // 이름과 이메일이 존재한다면,
        try{
            // const hasUser = await prisma.User.findFirst({
            //     where:{
            //         keyword:keyword
            //     }
            // })
        }catch (e){

        }
    }
}

exports.module  = {createUser}