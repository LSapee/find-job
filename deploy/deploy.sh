#!/bin/bash

# 저장소로부터 최신 코드를 가져오거나 업데이트
git pull origin main

# Node.js 의존성 설치
npm install

# PM2를 사용하여 애플리케이션 재시작
# 여기서 'my-app'는 PM2가 관리하는 애플리케이션 이름입니다. 실제 애플리케이션에 맞게 수정하세요.
pm2 restart index


