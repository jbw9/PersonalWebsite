#!/usr/bin/env bash
# Deploys Pulse (create or update): DynamoDB visits table, IAM role, Lambda, public Function URL.
# Writes the URL to ../.env.local as REACT_APP_PULSE_URL, which CRA bakes into the next build.
# The stats key lives only in the Lambda's env and in pulse/.key (gitignored); /stats asks for it.
set -euo pipefail
cd "$(dirname "$0")"

REGION=${REGION:-us-east-1}
NAME=pulse
ROLE=pulse-lambda
TABLE=pulse-visits
ORIGINS='["https://jonathanbw.me","https://www.jonathanbw.me","https://jbw9.github.io","http://localhost:3000","http://127.0.0.1:3000","http://localhost:3001","http://127.0.0.1:3001"]'
export AWS_REGION=$REGION AWS_PAGER=""

ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
echo "account $ACCOUNT · region $REGION"

[ -f .key ] || openssl rand -hex 16 > .key
KEY=$(cat .key)

rm -f pulse.zip && zip -qj pulse.zip handler.mjs

if ! aws dynamodb describe-table --table-name $TABLE >/dev/null 2>&1; then
  aws dynamodb create-table --table-name $TABLE --billing-mode PAY_PER_REQUEST \
    --attribute-definitions AttributeName=pk,AttributeType=S AttributeName=sk,AttributeType=S \
    --key-schema AttributeName=pk,KeyType=HASH AttributeName=sk,KeyType=RANGE >/dev/null
  aws dynamodb wait table-exists --table-name $TABLE
  aws dynamodb update-time-to-live --table-name $TABLE \
    --time-to-live-specification Enabled=true,AttributeName=expires >/dev/null
  echo "created table $TABLE"
fi

if ! ROLE_ARN=$(aws iam get-role --role-name $ROLE --query Role.Arn --output text 2>/dev/null); then
  ROLE_ARN=$(aws iam create-role --role-name $ROLE --query Role.Arn --output text --assume-role-policy-document \
    '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}')
  aws iam attach-role-policy --role-name $ROLE --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
  echo "created role $ROLE; waiting for IAM to propagate"
  sleep 12
fi
aws iam put-role-policy --role-name $ROLE --policy-name pulse --policy-document "{
  \"Version\": \"2012-10-17\",
  \"Statement\": [
    {\"Effect\": \"Allow\", \"Action\": [\"dynamodb:UpdateItem\", \"dynamodb:Query\"],
     \"Resource\": \"arn:aws:dynamodb:$REGION:$ACCOUNT:table/$TABLE\"}
  ]}"

ENV="Variables={TABLE=$TABLE,KEY=$KEY}"
if aws lambda get-function --function-name $NAME >/dev/null 2>&1; then
  aws lambda update-function-code --function-name $NAME --zip-file fileb://pulse.zip >/dev/null
  aws lambda wait function-updated --function-name $NAME
  aws lambda update-function-configuration --function-name $NAME --environment "$ENV" >/dev/null
  aws lambda wait function-updated --function-name $NAME
  echo "updated function $NAME"
else
  aws lambda create-function --function-name $NAME --runtime nodejs22.x --architectures arm64 \
    --handler handler.handler --role "$ROLE_ARN" --zip-file fileb://pulse.zip \
    --timeout 10 --memory-size 128 --environment "$ENV" >/dev/null
  aws lambda wait function-active --function-name $NAME
  echo "created function $NAME"
fi
# Bounds the DynamoDB bill if someone hammers the public URL
aws lambda put-function-concurrency --function-name $NAME --reserved-concurrent-executions 3 >/dev/null

CORS="AllowOrigins=$ORIGINS,AllowMethods=[\"GET\",\"POST\"],AllowHeaders=[\"content-type\"],MaxAge=86400"
if aws lambda get-function-url-config --function-name $NAME >/dev/null 2>&1; then
  aws lambda update-function-url-config --function-name $NAME --cors "$CORS" >/dev/null
else
  aws lambda create-function-url-config --function-name $NAME --auth-type NONE --cors "$CORS" >/dev/null
  aws lambda add-permission --function-name $NAME --statement-id public-url --action lambda:InvokeFunctionUrl \
    --principal "*" --function-url-auth-type NONE >/dev/null
  aws lambda add-permission --function-name $NAME --statement-id public-url-invoke --action lambda:InvokeFunction \
    --principal "*" --invoked-via-function-url >/dev/null
fi
URL=$(aws lambda get-function-url-config --function-name $NAME --query FunctionUrl --output text)

ENVFILE=../.env.local
touch $ENVFILE
grep -v '^REACT_APP_PULSE_URL=' $ENVFILE > $ENVFILE.tmp || true
echo "REACT_APP_PULSE_URL=$URL" >> $ENVFILE.tmp && mv $ENVFILE.tmp $ENVFILE
echo "Pulse is live at $URL (written to .env.local; restart the dev server to pick it up)"
echo "Stats key: $KEY (saved in pulse/.key)"
