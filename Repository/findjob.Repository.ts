import {prisma} from "./prismaDB";
import {MyList, userLoggedIn} from "../types/types";
const {getEmail,getUserId} =require("./user.Repository")

// 데이터 가져오기
const findAlljob = async (keyword:string,expAll:string,exp:number|string,stNumber:number,loggedIn:userLoggedIn):Promise<MyList[]|boolean>=>{
    const myList:MyList[] = [];
    try{
        //키워드의 ID 검색
        let keywordId:number;
        let userId:number = -1;
        if(loggedIn.sign){
            const email = await getEmail(loggedIn.access_token);
            userId = await getUserId(email);
        }
        // 해당 키워드가 존재하는지 DB검색
        const keywordFind = await prisma.keywords.findFirst({
            where:{
                keyword:keyword
            }
        })
        // 키워드가 없으면 에러 발생
        if(keywordFind===null){
            throw new Error("키워드가 존재하지 않습니다.");
        }else{
            keywordId = keywordFind.id;
        }
    const experience_level:string = exp == "신입"?"%신입%":exp=="전부"?"전부":`%${exp}년%`;
        if(exp==="전부"){
            let jobs;
            //그냥 전부 가져오기
            if(userId===-1){
                jobs = await prisma.job_Keywords.findMany({
                    where:{
                        keyword_id: keywordId,
                    },
                    include: {
                        posting:{
                            select:{
                                company_name:true,
                                title:true,
                                experience_level:true,
                                education_level:true,
                                location:true,
                                tech_stack:true,
                                closing_date:true,
                                link:true
                            },
                        }
                    },
                    orderBy: {
                        posting: {
                            closing_date: 'asc'
                        }
                    },
                    skip:stNumber,
                    take:100
                })
            }else{
                const comp = await prisma.submissions.findMany({
                    where:{
                        user_id:userId,
                    }
                })
                const appliedCompanyNames = comp.map(application => application.company_name);
                jobs = await prisma.job_Keywords.findMany({
                    where:{
                        keyword_id: keywordId,
                        posting:{
                            company_name: {
                                notIn: appliedCompanyNames, // 지원한 회사명 제외
                            },
                        }
                    },
                    include: {
                        posting:{
                            select:{
                                company_name:true,
                                title:true,
                                experience_level:true,
                                education_level:true,
                                location:true,
                                tech_stack:true,
                                closing_date:true,
                                link:true
                            },
                        }
                    },
                    orderBy: {
                        posting: {
                            closing_date: 'asc'
                        }
                    },
                    skip:stNumber,
                    take:100
                })
            }
            jobs.forEach(item =>{
                myList.push({
                    company :item.posting.company_name,
                    postTitle :item.posting.title,
                    exp : item.posting.experience_level,
                    edu : item.posting.education_level,
                    loc : item.posting.location,
                    skillStacks : item.posting.tech_stack,
                    endDate : item.posting.closing_date,
                    postURL : item.posting.link
                })
            })
        }
        else if(expAll==="true"){
            //경력 무관 포함
            if(userId===-1){
                const expA = "%경력무관%";
                const jobs = await prisma.job_Keywords.findMany({
                    where:{
                        keyword_id: keywordId,
                        posting:{
                            OR:[
                                {experience_level:{
                                        contains: experience_level,
                                    }},
                                {experience_level:{
                                        contains: expA,
                                    }
                                }
                            ]
                        }
                    },
                    include: {
                        posting:{
                            select:{
                                company_name:true,
                                title:true,
                                experience_level:true,
                                education_level:true,
                                location:true,
                                tech_stack:true,
                                closing_date:true,
                                link:true
                            },
                        }
                    },
                    orderBy: {
                        posting: {
                            closing_date: 'asc'
                        }
                    },
                    skip:stNumber,
                    take:100
                })
                jobs.forEach(item =>{
                    myList.push({
                        company :item.posting.company_name,
                        postTitle :item.posting.title,
                        exp : item.posting.experience_level,
                        edu : item.posting.education_level,
                        loc : item.posting.location,
                        skillStacks : item.posting.tech_stack,
                        endDate : item.posting.closing_date,
                        postURL : item.posting.link
                    })
                })
            }else{
                const comp = await prisma.submissions.findMany({
                    where:{
                        user_id:userId,
                    }
                })
                const appliedCompanyNames = comp.map(application => application.company_name);
                const expA = "%경력무관%";
                const jobs = await prisma.job_Keywords.findMany({
                    where:{
                        keyword_id: keywordId,
                        posting:{
                            company_name: {
                                notIn: appliedCompanyNames, // 지원한 회사명 제외
                            },
                            OR:[
                                {experience_level:{
                                        contains: experience_level,
                                    }},
                                {experience_level:{
                                        contains: expA,
                                    }
                                }
                            ]
                        }
                    },
                    include: {
                        posting:{
                            select:{
                                company_name:true,
                                title:true,
                                experience_level:true,
                                education_level:true,
                                location:true,
                                tech_stack:true,
                                closing_date:true,
                                link:true
                            },
                        }
                    },
                    orderBy: {
                        posting: {
                            closing_date: 'asc'
                        }
                    },
                    skip:stNumber,
                    take:100
                })
                jobs.forEach(item =>{
                    myList.push({
                        company :item.posting.company_name,
                        postTitle :item.posting.title,
                        exp : item.posting.experience_level,
                        edu : item.posting.education_level,
                        loc : item.posting.location,
                        skillStacks : item.posting.tech_stack,
                        endDate : item.posting.closing_date,
                        postURL : item.posting.link
                    })
                })
            }

        }else{
            // 해당 경력만
            if(userId===-1){
                const jobs = await prisma.job_Keywords.findMany({
                    where:{
                        keyword_id: keywordId,
                        posting:{
                            experience_level:{
                                contains: experience_level,
                            }
                        }
                    },
                    include: {
                        posting:{
                            select:{
                                company_name:true,
                                title:true,
                                experience_level:true,
                                education_level:true,
                                location:true,
                                tech_stack:true,
                                closing_date:true,
                                link:true
                            },
                        }
                    },
                    orderBy: {
                        posting: {
                            closing_date: 'asc'
                        }
                    },
                    skip:stNumber,
                    take:100,

                })
                jobs.forEach(item =>{
                    myList.push({
                        company :item.posting.company_name,
                        postTitle :item.posting.title,
                        exp : item.posting.experience_level,
                        edu : item.posting.education_level,
                        loc : item.posting.location,
                        skillStacks : item.posting.tech_stack,
                        endDate : item.posting.closing_date,
                        postURL : item.posting.link
                    })
                })
            }else{
                const comp = await prisma.submissions.findMany({
                    where:{
                        user_id:userId,
                    }
                })
                const appliedCompanyNames = comp.map(application => application.company_name);
                const jobs = await prisma.job_Keywords.findMany({
                    where:{
                        keyword_id: keywordId,
                        posting:{
                            experience_level:{
                                contains: experience_level,
                            },
                            company_name: {
                                notIn: appliedCompanyNames, // 지원한 회사명 제외
                            },
                        }
                    },
                    include: {
                        posting:{
                            select:{
                                company_name:true,
                                title:true,
                                experience_level:true,
                                education_level:true,
                                location:true,
                                tech_stack:true,
                                closing_date:true,
                                link:true
                            },
                        }
                    },
                    orderBy: {
                        posting: {
                            closing_date: 'asc'
                        }
                    },
                    skip:stNumber,
                    take:100,

                })
                jobs.forEach(item =>{
                    myList.push({
                        company :item.posting.company_name,
                        postTitle :item.posting.title,
                        exp : item.posting.experience_level,
                        edu : item.posting.education_level,
                        loc : item.posting.location,
                        skillStacks : item.posting.tech_stack,
                        endDate : item.posting.closing_date,
                        postURL : item.posting.link
                    })
                })
            }


        }
    }catch(e){
        return false;
    }finally {
        await prisma.$disconnect();
    }
    return myList;
}
// 모든 키워드 가져오기
const findAllkeyWords = async ():Promise<string[]|boolean> =>{
    const keywords:string[] =[];
    let dataIsIn = false;
    try{
        const keywordArr = await prisma.keywords.findMany({
            select:{
                keyword:true
            }
        })
        if(keywordArr===null){
            throw new Error("키워드가 존재하지 않습니다.");
        }
        dataIsIn=true;
        for(const keyword of keywordArr) keywords.push(keyword.keyword);
    }catch(e){
        console.error(e);
    }
    return dataIsIn ? keywords : dataIsIn;
}

module.exports={findAlljob,findAllkeyWords}