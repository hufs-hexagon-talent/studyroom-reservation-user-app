FROM node:20-alpine AS build-stage
WORKDIR /app


ENV REACT_APP_API_URL=APP__REPLACE_ME__REACT_APP_API_URL

# 의존성 파일 복사 및 설치
COPY package.json yarn.lock ./
RUN yarn install

# 소스 코드 복사 및 애플리케이션 빌드
COPY . .
RUN yarn build

# 두 번째 단계: Nginx를 사용하여 빌드된 앱을 서빙
FROM nginx:stable-alpine AS production-stage
WORKDIR /app
COPY --from=build-stage /app/entrypoint.sh /app
RUN chmod +x /app/entrypoint.sh

# React 앱의 빌드 결과물을 Nginx 서버의 서빙 디렉토리로 복사
COPY --from=build-stage /app/build /usr/share/nginx/html

# 기본 Nginx 설정을 사용하거나 커스텀 설정 파일을 복사
COPY nginx.conf /etc/nginx/nginx.conf


# Nginx 시작
EXPOSE 80
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["sh", "-c", "/app/entrypoint.sh nginx -g 'daemon off;'"]
