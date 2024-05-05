import {prisma} from "./prismaDB";
const {verifyIdToken} = require("../auth/auth");
import {idTokenType} from '../types/types';

const loginUser = async (token:string):Promise<boolean> =>{
    try{
        const tokenData:idTokenType = await verifyIdToken(token)
        const oauthLogin = tokenData["identities"];
        const oauthName:string = tokenData["cognito:username"];
        const userName:string = tokenData.given_name;
        const userEmail:string = tokenData.email;
        const UserHasId = await prisma.users.findFirst({
            where:{
                email:userEmail
            }
        });
        // User가 없을경우 유저 생성
        if(UserHasId===null){
            if(oauthLogin===undefined) {
                await prisma.users.create({
                    data:{
                        username:userName,
                        cognito_name:oauthName,
                        email:userEmail,
                    }
                })
            }else{
                await prisma.users.create({
                    data:{
                        username:userName,
                        google_name:oauthName,
                        email:userEmail,
                    }
                })
            }
        }else{
           // 유저가 있을경우 프로필만 업데이트 해주기
           if(oauthLogin===undefined){
               await prisma.users.update({
                   where:{
                       email:userEmail
                   },
                   data:{
                       cognito_name:oauthName
                   }
               })
           }else{
               await prisma.users.update({
                   where:{
                       email:userEmail
                   },
                   data:{
                       google_name:oauthName
                   }
               })
           }
        }

    }catch (e){
        console.log("error",e);
        return false;
    }
    return true;
}

module.exports  = {loginUser}