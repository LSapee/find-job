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
            throw new Error("에러 발생")
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
// 지원 완료 취소
const application_completed_company_cen = async (accessToken:string,companyName:string):Promise<void>=>{
    try{
        const email =await getEmail(accessToken);
        const userId:number = await getUserId(email);
        const deleteCompanyOne = await prisma.submissions.findFirst({
            where:{
                user_id:userId,
                company_name:companyName,
                job_title:{
                    not:"제외"
                }
            }
        })
        if(deleteCompanyOne===null){
            throw new Error("없어");
        }
        await prisma.submissions.delete({
            where:{
                submission_id:deleteCompanyOne.submission_id
            }
        })
    }catch (e){
        console.error("이미 제외된 회사임")
    }
}

module.exports={application_completed,application_completed_companyList,application_completed_company_cen}