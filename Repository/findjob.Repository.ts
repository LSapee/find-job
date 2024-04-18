import {prisma} from "./prismaDB";
import {MyList} from "../types/myList";

const findAlljob = async (keyword:string,expAll:string,exp:number|string,stNumber:number):Promise<MyList[]|boolean>=>{
    const myList:MyList[] = [];
    try{
        //키워드의 ID 검색
        let keywordId:number;
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
            console.log("여기 돌아감 경력무관 포함")
            //경력 무관 포함
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
            console.log("여기 돌아감 경력무관 X")
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