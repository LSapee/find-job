import {NextFunction, Request, Response} from "express";
const {isLoggedIn} = require('./tokenUtils');

export async function requireLogin(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies['access_token'];
    if (!accessToken) {
        console.log("로그인 필요");
        return res.redirect("https://findjob.lsapee.com");
    } else {
        console.log("로그인 검증 requireLogin");
        const TokenT = await isLoggedIn(accessToken);
        console.log("TokenT",TokenT)
        if (TokenT === null || TokenT.sign === false) {
            console.log("검증 실패")
            res.clearCookie("access_token", { domain: '.lsapee.com' });
            res.clearCookie("access", { domain: '.lsapee.com' });
            return res.redirect("https://findjob.lsapee.com");
        } else {
            console.log("쿠키에 다시 값 세팅")
            res.cookie("access_token",TokenT.accessToken,{
                httpOnly:true,
                domain: '.lsapee.com',
                secure: true,
                sameSite: 'none'
            });
            res.cookie("access",TokenT.sign,{
                domain: '.lsapee.com',
                secure: true,
                sameSite: 'none'
            });
            console.log("검증 성공");
            next();
        }
    }

}
