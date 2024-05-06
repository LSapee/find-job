import {NextFunction, Request, Response} from "express";
const {isLoggedIn} = require('./tokenUtils');

export async function requireLogin(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies['access_token'];
    if (!accessToken) {
        console.log("로그인 필요");
        return res.redirect("https://findjob.lsapee.com");
    } else {
        console.log("로그인 검증 중");
        const TokenT = await isLoggedIn(accessToken);
        if (TokenT === null || TokenT.sign === false) {
            res.clearCookie("access_token", { domain: '.lsapee.com' });
            res.clearCookie("access", { domain: '.lsapee.com' });
            return res.redirect("https://findjob.lsapee.com");
        } else {
            next();
        }
    }
}
