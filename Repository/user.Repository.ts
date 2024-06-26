import {prisma} from "./prismaDB";
const {verifyIdToken} = require("../auth/auth");
import {idTokenType} from '../types/types';

//로그인 하기 -> 아이디 없을경우 생성 있을경우 로그인 처리
const loginUser = async (token:string|null):Promise<boolean|string> =>{
    let email:string = "";
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
        email=userEmail;
    }catch (e){

        console.log("error LoginUser",e);
        return false;
    }
    return email;
}
// 리프레시 토큰 가져오기
const getRefreshToken = async (access_token:string): Promise<string|null> =>{
    let refresh_token:string = "";
    console.log("refresh_token 가져오기");
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
    console.log("refresh_token 가져오기 성공")
    return refresh_token;
}
//리프레시 토큰 및 엑세스 토큰 DB에 저장
const saveTokens = async (refresh_token:string,access_token:string,email:string):Promise<boolean>=>{
    try{
        await prisma.tokens.create({
            data:{
                refresh_token:refresh_token,
                access_token:access_token,
                email:email,
            }
        })
    }catch (e){
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
// 리프레시 토큰 삭제
const deleteRefreshToken  = async (refresh_token:string):Promise<void> =>{
    try{
        const tokenID = await prisma.tokens.findFirst({
            where:{
                refresh_token:refresh_token
            }
        })
        if(tokenID===null){
            throw new Error("토큰이 없어요");
        }
        await prisma.tokens.delete({
            where:{
                token_id:tokenID.token_id
            }
        })
    }catch (e){
        console.log("이미 토큰이 삭제되었어요")
    }
}
// 엑세스 토큰 삭제
const deleteAccessToken  = async (access_token:string):Promise<void> =>{
    try{
        const tokenID = await prisma.tokens.findFirst({
            where:{
                access_token:access_token
            }
        })
        if(tokenID===null){
            console.log("토큰이 없어서 에러 발생")
            throw new Error("토큰이 없어요");
        }
        await prisma.tokens.delete({
            where:{
                token_id:tokenID.token_id
            }
        })
    }catch (e){
        console.log("이미 토큰이 삭제되었어요")
    }
}
// 엑세스 토큰을 가지고 email가져오기
const getEmail = async (token:string):Promise<string|null> =>{
    let resultEmail:string = "";
    try{
        const tokenID = await prisma.tokens.findFirst({
            where:{
                access_token:token
            }
        })
        if(tokenID===null){
            throw new Error("토큰이 없어요");
        }
        resultEmail = tokenID.email;
    }catch (e){
        console.log("이미 토큰이 삭제되었어요 getEmail")
        return null;
    }
    return resultEmail;

}
// Email로 UserId 가져오기
const getUserId = async (email:string):Promise<number> =>{
    let resultUserId:number = -1;
    try{
        const User = await prisma.users.findFirst({
            where:{
                email:email
            }
        })
        if(User===null){
            throw new Error("유저가 없어요");
        }
        resultUserId = User.user_id;
    }catch (e){
        console.error("e",e)
        return -1;
    }
    return resultUserId;
}
// 삭제를 위한 UserName 가져오기
const getUserName = async (user_id:number):Promise<string> =>{
    let resultUserName:string = "";
    try{
       const myData = await prisma.users.findFirst({
           where:{
               user_id:user_id
           }
       })
        if(myData===null){
            throw new Error("이미 탈퇴된 회원");
        }
        if(myData.google_name===null) resultUserName = myData.username;
        else resultUserName = myData.google_name;
    }catch (e){
        console.log("getUserName e",e)
    }
    return resultUserName;
}
// user삭제 -> Submissions전부 삭제
const delUser = async (userId:number):Promise<void> =>{
    try{
        const AllSub = await prisma.submissions.findMany({
            where:{
                user_id:userId
            }
        })
        if(AllSub===null){
            throw new Error("삭제 실패")
        }
        await prisma.submissions.deleteMany({
            where:{
                user_id:userId
            }
        })
        await prisma.users.delete({
            where:{
                user_id:userId
            }
        })

    }catch (e){
        console.error("delAllSuubMissions e",e)
    }

}

module.exports  = {loginUser,saveTokens,getRefreshToken,updateAccessToken,deleteRefreshToken,getEmail,deleteAccessToken,getUserId,getUserName,delUser}