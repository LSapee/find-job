const cron = require("node-cron");

export const delFailCompanys= async ()=>{
    cron.schedule(("0 0 * * *"),async ()=>{
       // 불합격 및 지원완료상태/서류확인 상태인 공고 30일 이상된 공고 자동 삭제
        
    });
}
// EC2가 켜질 타이밍
// export const ec2StartTimet = async ()=>{
//     cron.schedule(("0 0 * * *"), async () =>{
//         await ec2Start();
//         setTimeout(async () => {
//             await startPm2OnEC2Instance();
//         }, 2 * 60 * 1000);
//     })
// }
