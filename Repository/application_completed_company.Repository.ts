import {prisma} from "./prismaDB";
const {getEmail,getUserId} = require("./user.Repository");

interface resulteType {
    companyName:string,
    postTitle?:string,
    siteName:string,
    date:any
}

//회사 지원 완료처리
const application_completed = async (accessToken:string,companyName:string,titleName:string,siteName:string):Promise<boolean>=>{
    try{
        const email =await getEmail(accessToken);
        const userId = await getUserId(email);
        await prisma.submissions.create({
            data:{
                user_id:userId,
                company_name:companyName,
                job_title:titleName,
                site_name:siteName,
                status:"지원완료"
            }
        })
    }catch (e){
        console.log("이미 회사에 지원 되어있음")
        console.error("에러가 발생함")
        return false;
    }
    return true;
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
            },
            orderBy: {
                submitted_date:'asc'
            },
        })
        if(data===null){
            throw new Error("에러 발생")
        }
        data.forEach((one)=>{
            result.push({
                companyName:one.company_name,
                date :one.submitted_date,
                siteName:one.site_name,
                postTitle:one.job_title,
                status:one.status
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
//직접 지원 완료처리
const application_completed_company_write = async (accessToken:string,comN:string,postT:string,subS:string):Promise<boolean|resulteType>=>{
    let result:resulteType = {
        companyName:"",
        postTitle:"",
        siteName:"",
        date:""
    };
    try{
        const email =await getEmail(accessToken);
        const userId:number = await getUserId(email);
        const hasSub = await prisma.submissions.findFirst({
            where:{
                user_id:userId,
                company_name:comN
            }
        })
        if(hasSub!==null){
            throw new Error("이미 지원한 회사")
        }
        const data = await prisma.submissions.create({
            data:{
                user_id:userId,
                company_name:comN,
                job_title:postT,
                site_name:subS,
                status:"지원완료"
            }
        })
        if(data===null){
            throw new Error("이미 지원한 회사")
        }
        result ={
            companyName:data.company_name,
            postTitle:data.job_title,
            siteName:data.site_name==null?"": data.site_name,
            date:data.submitted_date,
        }
    }catch (e){
        return false;
    }
    return result;
}

const application_completed_status = async (accessToken:string,status:string,companyName:string):Promise<boolean> => {
    try{
        const email =await getEmail(accessToken);
        const userId = await getUserId(email);
        const submissionId = await prisma.submissions.findFirst({
            where:{
                user_id:userId,
                company_name:companyName,
            }
        })
        if(submissionId===null){
            throw new Error("에러 발생")
        }
        await prisma.submissions.update({
            where:{
                submission_id:submissionId.submission_id
            },data:{
                status:status
            }
        })
    }catch (e){
        return false;
    }
    return true;
}

module.exports={application_completed,application_completed_companyList,application_completed_company_cen,application_completed_company_write,application_completed_status}