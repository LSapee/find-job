import {prisma} from "./prismaDB";
const {getEmail,getUserId} = require("./user.Repository");
//회사 보지 않기
const neverSee = async (accessToken:string,companyName:string):Promise<void>=>{
    try{
        const email =await getEmail(accessToken);
        const userId = await getUserId(email);
        await prisma.submissions.create({
            data:{
                user_id:userId,
                company_name:companyName,
                job_title:"제외"
            }
        })
    }catch (e){
        console.log("이미 회사가 제외 되어있음")
        console.error("에러가 발생함")
    }

}
// 보지 않기로한 회사 목록
const neverSeeCompanys = async (accessToken:string):Promise<any[]>=>{
    const neverSeeCompanyList:any[] =[];
    try{
        const email =await getEmail(accessToken);
        const userId = await getUserId(email);
        const companys = await prisma.submissions.findMany({
            where:{
                user_id:userId
            }
        })
        if(companys===null){
            throw new Error("잘못됨")
        }
        companys.forEach(company => {
            neverSeeCompanyList.push({
                companyName:company.company_name,
                Date: company.submitted_date
            })
        })
    }catch (e){
        console.error("에러가 발생함")
    }
    return neverSeeCompanyList;
}
// 보지 않기로한 회사 목록에서 제거
const delneverSeeCompany = async (accessToken:string,companyName:string):Promise<void> =>{
    try{
        const email =await getEmail(accessToken);
        const userId:number = await getUserId(email);
        const deleteCompanyOne = await prisma.submissions.findFirst({
            where:{
                user_id:userId,
                company_name:companyName
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

module.exports={neverSee,neverSeeCompanys,delneverSeeCompany}