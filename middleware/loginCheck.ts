import { Request, Response, NextFunction } from 'express';
const {isLoggedIn} =require('./tokenUtils');
export async function checkToken(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies['access_token'];
    if(accessToken) {
        console.log("로그인 되어있음")
        const TokenT = await isLoggedIn(accessToken);
        if(TokenT===null || TokenT.sign === false){
            res.clearCookie("access_token",{domain: '.lsapee.com'});
            res.clearCookie("access",{domain: '.lsapee.com'});
            return res.redirect("https://findjob.lsapee.com/error");
        }else{
            next();
        }
    }else{
        console.log("로그인 안되어있음")
        next();
    }
}
