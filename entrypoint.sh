#!/usr/bin/env sh
set -Ex

echo "Check that we have environment vars"
test -n "$REACT_APP_API_URL"
find /usr/share/nginx/html \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP__REPLACE_ME__REACT_APP_API_URL#$REACT_APP_API_URL#g"

echo "Starting Nginx"
exec "$@"