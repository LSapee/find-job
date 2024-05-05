import {prisma} from "./prismaDB";
const {verifyIdToken} = require("../auth/auth");
import {idTokenType} from '../types/types';

const loginUser = async (token:string):Promise<boolean> =>{
    try{
        const tokenData:idTokenType = await verifyIdToken(token)
        const oauthLogin = tokenData["identities"];
        console.log(tokenData["identities"])
        const oauthName:string = tokenData["cognito:username"];
        const userName:string = tokenData.given_name;
        const userEmail:string = tokenData.email;
        if(oauthLogin===undefined) {
            //cognito login의 경우
            const UserFind = await prisma.users.findFirst({
                where: {
                    cognito_name: oauthName,
                }
            });
            if(UserFind===null){
                await prisma.users.create({
                    data:{
                        username:userName,
                        cognito_name:oauthName,
                        email:userEmail,
                    }
                })
            }
        }else{
            // google login
            const UserFind = await prisma.users.findFirst({
                where: {
                    google_name: oauthName,
                }
            });
            if(UserFind===null){
                await prisma.users.create({
                    data:{
                        username:userName,
                        google_name:oauthName,
                        email:userEmail,
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