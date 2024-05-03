import {prisma} from "./prismaDB";
const {getEmail,getName} = require("../auth/auth");

const createUser = async (token:string):Promise<null|string> =>{
    console.log("id_token",token)
    try{
        const email =await getEmail(token);
        const name = await getName(token);
        if(name!==null &&email!==null ){
            console.log("token으로 값 가져오기 성공");
            const UserFind = await prisma.users.findFirst({
                where:{
                    username:name,
                    email:email,
                }
            })
            if(UserFind===null) {
                await prisma.users.create({
                    data:{
                        username: name,
                        email: email,
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