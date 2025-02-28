#!/usr/bin/env sh
set -Ex

echo "Check that we have environment vars"
echo "REACT_APP_API_URL is: $REACT_APP_API_URL"
echo "REACT_APP_DEPARTMENT_ID is: $REACT_APP_DEPARTMENT_ID"

test -n "$REACT_APP_API_URL"
test -n "$REACT_APP_DEPARTMENT_ID"

find /usr/share/nginx/html \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i"" "s#APP__REPLACE_ME__REACT_APP_API_URL#$REACT_APP_API_URL#g"
find /usr/share/nginx/html \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i"" "s#APP__REPLACE_ME__REACT_APP_DEPARTMENT_ID#$REACT_APP_DEPARTMENT_ID#g"

echo "Starting Nginx"
exec "$@"