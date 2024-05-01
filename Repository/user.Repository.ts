import {prisma} from "./prismaDB";
const {getOauthName,getEmail,getName} = require("../auth/auth");

const createUser = async (token:string):Promise<null|string> =>{
    try{
        const OauthName =await getOauthName(token);
        const email =await getEmail(token);
        const name = await getName(token);
        let oauth:string = "cognito"
        if(name!==null &&email!==null &&name!==null){
            const isGoogleOauth:boolean = OauthName.includes("google");
            if(isGoogleOauth) oauth="google";
            const UserFind = await prisma.users.findFirst({
                where:{
                    username:name,
                    email:email,
                    oauth:oauth,
                }
            })
            if(UserFind===null) {
                await prisma.users.create({
                    data:{
                        username: name,
                        email: email,
                        oauth:oauth,
                    }
            });
                return "new User";
            }else{
                return "old User";
            }
        }
    }catch (e){
        return null;
    }
    return null;
}

module.exports  = {createUser}