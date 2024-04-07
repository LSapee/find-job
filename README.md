
[사이트 바로가기](https://findjob.lsapee.com)

### 사람인,잡코리아 구인공고 너무 많아서 봐야할 공고만 줄이기 위해서 만든 것.

## 잡코리아 및 사람인 구인공고 크롤링

 - 키워드 입력시 검색하여 보여주기
 - 해당 공고 박스 클릭시 해당 사이트의 구인글로 새로운 탭으로 해서 이동.

### 현재 문제점 및 개선 방향성
 
 - 사람인 크롤링 도중에 가씀씩 input값 enter발생 하지 않는 문제 발생-> 해결 (버튼클릭으로 변경하여)
 - 중복값을 제거해야함. -> 미정
 - 새로 고침을 할 경우 데이터가 날라가서 다시 크롤링 해야함. -> DB사용으로 해결 예정
 - 사람인이나 공고가 많은 경우에는 TimeOut 발생 -> DB로 옮겨서 해결할 예정.
 - node_schedule 사용하여 특정시간에 크롤링 되도록 변경 예정.

### HTTPS 연결

 - AWS ALB를 이용하여 구성
 - 클라이언트 -> 도메인 입력시 80 -> 443으로 리다이렉션 443포트에서 -> 대상그룹으로 전달 하게끔 처리
 - ALB 요금 발생으로 인하여 VPC 가용영역 4->2개로 변경 - 요금 발생으로 인하여 나중에 다시 연결 예정

### CI/CD 구성

 -  github Actions 이용하여 구성
 -  main 브런치에 변동사항 있을시 github Actions 실행
 -  test 자동화 구현X

### 현재

- DB 구성 및 크롤링 데이터 처리 어떻게 할지 생각중
- DB 입력데이터로 회사명,공고제목,경력,학력,지역,기술스택,마감일,URL로 크롤링 데이터 변경

### 추후 생각중인 기능

- 간편 로그인 또는 간단하게 로그인 가능하게 하여 지원 완료 공고는 보이지 않도록 하는 방안 생각중.
- 원티드 등 다른 구인사이트 크롤링 지원


