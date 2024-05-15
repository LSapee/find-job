import {NextFunction, Request, Response} from "express";
const {isLoggedIn} = require('./tokenUtils');

export async function requireLogin(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies['access_token'];
    if (!accessToken) {
        console.log("로그인 필요");
        return res.redirect("https://findjob.lsapee.com");
    } else {
        const TokenT = await isLoggedIn(accessToken);
        if (TokenT === null || TokenT.sign === false) {
            res.clearCookie("access_token", { domain: '.lsapee.com' });
            res.clearCookie("access", { domain: '.lsapee.com' });
            return res.redirect("https://findjob.lsapee.com");
        } else {
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
            req.cookies['access_token'] = TokenT.accessToken;
            next();
        }
    }

}
