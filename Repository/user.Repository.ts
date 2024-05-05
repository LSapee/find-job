import {prisma} from "./prismaDB";
const {verifyIdToken} = require("../auth/auth");
import {idTokenType} from '../types/types';

//로그인 하기 -> 아이디 없을경우 생성 있을경우 로그인 처리
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
//리프레시 토큰 가져오기
const getRefreshToken = async (access_token:string): Promise<string|null> =>{
    let refresh_token:string = "";
    try{
        const tokens = await prisma.tokens.findFirst({
            where:{
                access_token:access_token
            }
        })
        if(tokens===null){
            throw new Error("토큰 없어");
        }
        refresh_token= tokens.refresh_token;
    }catch(err){
        return null;
    }
    return refresh_token;
}
//리프레시 토큰 및 엑세스 토큰 DB에 저장
const saveTokens = async (refresh_token:string,access_token:string):Promise<boolean>=>{
    try{
        console.log("토큰 저장 진입")
        await prisma.tokens.create({
            data:{
                refresh_token:refresh_token,
                access_token:access_token
            }
        })
    }catch (e){
        console.log("e",e);
        return false;
    }
    return true;
}
//리프레시 토큰으로 엑세스 토큰 받기
const updateAccessToken = async (refresh_token:string,access_token:string):Promise<boolean> =>{
    try{
        const tokenID = await prisma.tokens.findFirst({
            where:{
                refresh_token:refresh_token
            }
        })
        if(tokenID===null){
            throw new Error("토큰이 없어요");
        }
        await prisma.tokens.update({
            where:{
                token_id :tokenID.token_id
            },
            data:{
                access_token:access_token
            }
        })
    }catch (e){
        return false;
    }
    return true;
}
module.exports  = {loginUser,saveTokens,getRefreshToken,updateAccessToken}