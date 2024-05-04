import {prisma} from "./prismaDB";
const {getEmail,getName} = require("../auth/auth");

const loginUser = async (token:string):Promise<boolean> =>{
    try{
        const email =await getEmail(token);
        const name = await getName(token);
        console.log("name",name)
        console.log("email",email)
        if(name!==null &&email!==null ){
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
            }
        }
    }catch (e){
        console.log("error",e);
        return false;
    }
    return true;
}

module.exports  = {loginUser}