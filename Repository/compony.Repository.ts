import {prisma} from "./prismaDB";
import * as http from "node:http";

//회사 보지 않기
const neverSee = async (accessToken:string,companyName:string):Promise<void>=>{
    try{
        const emailT = await prisma.tokens.findFirst({
            where:{
                access_token:accessToken
            }
        })
        if(emailT===null){
            throw new Error("잘못된 회원")
        }
        const user =  await prisma.users.findFirst({
            where:{
                email:emailT.email
            }
        })
        if(user===null){
            throw new Error("잘못된 회원")
        }
        await prisma.submissions.create({
            data:{
                user_id:user.user_id,
                company_name:companyName,
                job_title:"제외"
            }
        })
    }catch (e){
        console.error("에러가 발생함")

    }

}
// 보지 않기로한 회사 목록
const neverSeeCompanys = async (accessToken:string):Promise<any[]>=>{
    const neverSeeCompanyList:any[] =[];
    try{
        const emailT = await prisma.tokens.findFirst({
            where:{
                access_token:accessToken
            }
        })
        if(emailT===null){
            throw new Error("잘못된 회원")
        }
        const user =  await prisma.users.findFirst({
            where:{
                email:emailT.email
            }
        })
        if(user===null){
            throw new Error("잘못된 회원")
        }
        const companys = await prisma.submissions.findMany({
            where:{
                user_id:user.user_id
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

module.exports={neverSee,neverSeeCompanys}