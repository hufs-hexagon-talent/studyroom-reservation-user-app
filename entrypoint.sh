#!/bin/sh
set -eu

# 환경 값은 config.js(window.env) 한 파일에만 주입한다.
# 해시 붙은 번들 파일을 고치면 장기 캐시(immutable)와 충돌한다.
CONFIG=/usr/share/nginx/html/config.js

: "${REACT_APP_API_URL:?REACT_APP_API_URL 이 비어 있습니다. compose 의 environment 를 확인하세요.}"

sed -i "s#APP__REPLACE_ME__REACT_APP_API_URL#${REACT_APP_API_URL}#g" "$CONFIG"
sed -i "s#APP__REPLACE_ME__REACT_APP_DEPARTMENT_ID#${REACT_APP_DEPARTMENT_ID:-1}#g" "$CONFIG"

exec "$@"
