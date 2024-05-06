import { Request, Response, NextFunction } from 'express';
const {isLoggedIn} = require("./auth/auth");
const {getEmail} = require("./Repository/user.Repository");

export async function checkToken(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies['access-token'];
    if(accessToken) {
        const TokenT = await isLoggedIn(accessToken);
        if(TokenT.sign === false){
            res.clearCookie("access_token",{domain: '.lsapee.com'});
            res.clearCookie("access",{domain: '.lsapee.com'});
            return res.redirect("https://findjob.lsapee.com/error");
        }else{
            req.userEmail = await getEmail(TokenT.accessToken);
            next();
        }
    }else{
        next();
    }
}