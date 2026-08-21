FROM node:20-alpine AS build-stage
WORKDIR /app

# 의존성 파일 복사 및 설치
COPY package.json yarn.lock ./
RUN yarn install

# 소스 코드 복사 및 애플리케이션 빌드
COPY . .
RUN yarn build

# 두 번째 단계: Nginx를 사용하여 빌드된 앱을 서빙
FROM nginx:stable-alpine AS production-stage
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY --from=build-stage /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
