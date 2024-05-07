import {prisma} from "./prismaDB";
import {MyList} from "../types/types";
const {dateArr} = require("../utils/utils");

// 크롤링 데이터 DB에 넣어주기
const crawlerRepository =async (Mylists:MyList[], keyWord:string):Promise<boolean> =>{
    let ans :boolean = true;
    try{
        // 키워드 ID 찾기
        const keyWordFind = await prisma.keywords.findFirst({
            where:{
                keyword:keyWord
            }
        })
        // 키워드 없을시 에러 발생시켜서 처리
        if(keyWordFind===null){
            throw new Error("키워드가 없어");
        }
        const keywordId:number = keyWordFind.id;
        for (const item of Mylists) {
            // 해당 게시글 있는지 확인
            const okData = await prisma.job_Posting.findFirst({
                where :{
                    title: item.postTitle,
                    company_name:item.company
                }
            })
            // 해당 포스터가 이미 존재한다면
            if(okData!==null){
                const postId:number = okData.id
                //해당 게시글 업데이트
                await prisma.job_Posting.update({
                    where:{
                        id: postId
                    },
                    data:{
                        company_name :item.company,
                        title :item.postTitle,
                        experience_level:item.exp.toString(),
                        education_level :item.edu,
                        location:item.loc,
                        tech_stack :item.skillStacks,
                        closing_date:item.endDate,
                        link:item.postURL.toString(),
                    }
                })
                // 검색한 키워드가 해당 url과 연결되어있는지 확인
                const keywordIn  = await prisma.job_Keywords.findFirst({
                    where:{
                        posting_id:postId,
                        keyword_id:keywordId
                    }
                })
                // 연결되어 있지 않다면 연결
                if(keywordIn===null){
                    await prisma.job_Keywords.create({
                        data:{
                            posting_id:postId,
                            keyword_id:keywordId
                        }
                    })
                }else{
                    //연결되어있으면 그냥 건너뛰기
                    continue;
                }
            }else{
                // 새로운 글 등록하기
                const thisPost = await prisma.job_Posting.create({
                    data: {
                        company_name :item.company,
                        title :item.postTitle,
                        experience_level:item.exp.toString(),
                        education_level :item.edu,
                        location:item.loc,
                        tech_stack :item.skillStacks,
                        closing_date:item.endDate,
                        link:item.postURL.toString(),
                    }
                })
                // 해당 글과 키워드를 연결하기
                await prisma.job_Keywords.create({
                    data:{
                        posting_id:thisPost.id,
                        keyword_id:keywordId
                    }
                })
            }
        }
    }catch(e){
        console.error(e)
        ans =false;
    }finally{
        await prisma.$disconnect();
    }
    return ans;
}
// 키워드 리스트 가져오기
const findKeywords = async ():Promise<string[]>=>{
    const keywords:string[] = [];
    try{
        const keywordList = await prisma.keywords.findMany({
            select:{
                keyword:true
            }
        })
        keywordList.forEach(item =>{
            keywords.push(item.keyword);
        })
    }catch(e){
        console.error(e);
    }finally {
        await prisma.$disconnect();
    }
    return keywords;
}
// 기간지난 공고 DB에서 삭제하기 및 마감일 없는 공고 DB에서 삭제
const postDel = async ():Promise<boolean>=>{
    try{
        const postListNum = await prisma.job_Posting.count();
        for(let i =0; i<postListNum; i+=1000){
            const postData = await prisma.job_Posting.findMany({
                skip: i,
                take: i+1000
            })
            if(postData===null){
                throw new Error("힘들다");
            }
            for(let j=0; j<postData.length; j++){
                if(postData[j].closing_date.includes("상시채용")||postData[j].closing_date.includes("오늘마감")||postData[j].closing_date.includes("채용시")||postData[j].closing_date.includes("내일마감")){
                    await prisma.job_Keywords.deleteMany({
                        where:{
                            posting_id:postData[j].id
                        }
                    })
                    await prisma.job_Posting.delete({
                        where:{
                            id:postData[j].id,
                            company_name:postData[j].company_name,
                        }
                    })
                }
                const endDate:number[] =dateArr(postData[j].closing_date);
                const thisM = new Date().getMonth()+1;
                const thisD = new Date().getDate();
                if(thisM>endDate[0]){
                    //공고를 지워야하는 경우 1
                    await prisma.job_Keywords.deleteMany({
                        where:{
                            posting_id:postData[j].id
                        }
                    })
                    await prisma.job_Posting.delete({
                        where:{
                            id:postData[j].id,
                            company_name:postData[j].company_name,
                        }
                    })
                }else{
                    if(thisD>endDate[1]){
                        //오늘이 공고를 지워야하는 경우 2
                        await prisma.job_Keywords.deleteMany({
                            where:{
                                posting_id:postData[j].id
                            }
                        })
                        await prisma.job_Posting.delete({
                            where:{
                                id:postData[j].id,
                                company_name:postData[j].company_name,
                            }
                        })
                    }
                }
            }
            console.log(`공고 ${i}~${i+1000}번 기간지난 공고 삭제 완료`);
        }
    }catch (e){
        return false;
    }
    return true;
}

module.exports = {crawlerRepository,findKeywords,postDel}

