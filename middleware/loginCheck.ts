import { Request, Response, NextFunction } from 'express';
import * as jwt from "jsonwebtoken";
import {accessTokenType} from "../types/types";
const {getKey} = require("../auth/auth");
const {getRefreshToken,updateAccessToken,deleteRefreshToken} = require("../Repository/user.Repository");

const tokenEndpoint = `${process.env.MYURL}/oauth2/token`;
interface TokenResponse {
    accessToken: string|boolean;
    decoded?: VerifyAccessTokenResult;
}
interface isLoggedInResponse{
    accessToken: string;
    sign :boolean
    decodeData?: VerifyAccessTokenResult;
}
type VerifyAccessTokenResult = accessTokenType | string | undefined;

const verifyAccessToken = async (token:string|null):Promise<TokenResponse|false> =>{
    if(token===null) return false;
    return new Promise((resolve, reject) => {
        jwt.verify(token, getKey, {
            issuer: process.env.JWKSURI,
            algorithms: ['RS256']
        }, async (err, decoded) => {
            if (err) {
                try {
                    console.log("accessToken 오류 있음")
                    const refreshToken = await getRefreshToken(token);
                    console.log("refreshToken 존재 여부",refreshToken)
                    const response = await fetch(tokenEndpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ refresh_token: refreshToken })
                    });
                    const data = await response.json();
                    if (response.ok) {
                        // 새 엑세스 토큰 디코드
                        const newDecoded = jwt.decode(data.access_token)as accessTokenType;
                        await updateAccessToken(refreshToken,data.access_token);
                        console.log("accessToken 재발급 완료")
                        resolve({accessToken: data.access_token, decoded: newDecoded} );
                    } else {
                        await deleteRefreshToken(refreshToken);
                        reject(false ); // API 오류 처리
                    }
                } catch (error) {
                    reject(false);  // 네트워크 오류 처리
                }
            } else {
                resolve({ accessToken: token, decoded: decoded as accessTokenType });
            }
        });
    });
};


const isLoggedIn = async (access_token:string):Promise<isLoggedInResponse|null> => {
    const tokenData = await verifyAccessToken(access_token).catch(e=>{return null});
    let myTokenisError = false;
    if (!tokenData) return ({accessToken: access_token, sign: myTokenisError})
    else if (tokenData === undefined) {
        return ({accessToken: access_token, sign: myTokenisError})
    } else {
        if((tokenData.decoded as accessTokenType).error === undefined){
            myTokenisError =true;
            }
        }
        return ({accessToken: access_token, sign :myTokenisError,decodeData : tokenData.decoded })
}

export async function checkToken(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies['access-token'];
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