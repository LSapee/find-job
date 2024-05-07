import {prisma} from "./prismaDB";
const {getEmail,getUserId} = require("./user.Repository");

//회사 지원 완료처리
const application_completed = async (accessToken:string,companyName:string,titleName:string,siteName:string):Promise<void>=>{
    try{
        const email =await getEmail(accessToken);
        const userId = await getUserId(email);
        await prisma.submissions.create({
            data:{
                user_id:userId,
                company_name:companyName,
                job_title:titleName,
                site_name:siteName,
            }
        })
    }catch (e){
        console.log("이미 회사에 지원 되어있음")
        console.error("에러가 발생함")
    }
}
// 지원 완료된 회사 목록 보여주기
const application_completed_companyList = async (accessToken:string):Promise<any[]>=>{
    const result:any[] =[];
    try{
        const email =await getEmail(accessToken);
        const userId = await getUserId(email);
        const data = await prisma.submissions.findMany({
            where:{
                user_id:userId,
                job_title:{
                    not:"제외"
                }
            }
        })
        if(data===null){
            throw new Error("dddd")
        }
        data.forEach((one)=>{
            result.push({
                companyName:one.company_name,
                date :one.submitted_date,
                siteName:one.site_name,
                postTitle:one.job_title
            })
        })
    }catch (e){
        console.error("목록 e",e)
    }
    return result;

}
module.exports={application_completed,application_completed_companyList}