import {prisma} from "./prismaDB";
import {MyList} from "../types/myList";

const findAlljob = async (keyword:string,expAll:string,exp:number|string,stNumber:number):Promise<MyList[]|boolean>=>{
    const myList:MyList[] = [];
    try{
        let keywordId:number;
        const keywordFind = await prisma.keywords.findFirst({
            where:{
                keyword:keyword
            }
        })
        if(keywordFind===null){
            //키워드로만 가능하게 할지 키워드에 맞는 기술스택,공고명 찾을지 일단은 보류
            throw new Error("키워드가 존재하지 않습니다.");
        }else{
            keywordId = keywordFind.id;
        }
        const experience_level:string = exp == "신입"?"신입":exp=="전부"?"전부":"경력무관";
        if(exp==="전부"){
            //그냥 전부 가져오기
            const jobs = await prisma.job_Keywords.findMany({
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
        else if(expAll==="true"){
            //경력 무관 포함
            const expA = "%경력무관%";
            const jobs = await prisma.job_Keywords.findMany({
                where:{
                    keyword_id: keywordId,
                    posting:{
                        OR:[
                            {experience_level:experience_level},
                            {experience_level:expA}
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
            // 해당 경력만
            const jobs = await prisma.job_Keywords.findMany({
                orderBy:{
                    posting:{
                        company_name:"asc"
                    }
                },
                where:{
                    keyword_id: keywordId,
                    posting:{
                        experience_level:experience_level
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
    }catch(e){
        return false;
    }finally {
        await prisma.$disconnect();
    }
    return myList;
}

module.exports={findAlljob}