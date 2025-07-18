#!/bin/bash

# .env 파일이 있는지 확인
if [ -f .env ]; then
    echo "📁 .env 파일을 로드하고 있습니다..."
    # .env 파일을 소스로 로드하여 환경변수 설정
    source .env
    
    # 환경변수 export
    export GOOGLE_PLACES_API_KEY
    export REACT_APP_KAKAO_MAP_API_KEY
    export REACT_APP_GOOGLE_PLACES_API_KEY
    
    echo "✅ 환경변수 로드 완료"
else
    echo "⚠️ .env 파일을 찾을 수 없습니다."
fi

# Spring Boot 서버 실행
echo "🚀 Spring Boot 서버를 시작합니다..."
./gradlew bootRun 