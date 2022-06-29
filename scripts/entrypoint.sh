#!/bin/sh -l


mkdir -p /root/.point/keystore/
echo "{}" > /root/.point/keystore/arweave.json
echo "{ \"phrase\": \"$DEPLOYER\" }" > /root/.point/keystore/key.json

cd /app

npm start &

until $(curl --output /dev/null --silent --head --fail http://localhost:8666/status/ping); do
    printf '.'
    sleep 5
done

echo "Point node started!"

DEPLOY_ARGS=""

if [ ${DEPLOY_CONTRACTS} ]; then
	DEPLOY_ARGS="${DEPLOY_ARGS} --contracts"	
fi

if [ "${DEPLOY_DEV}" ]; then
	DEPLOY_ARGS="${DEPLOY_ARGS} --dev"	
fi

echo ./point deploy $GITHUB_WORKSPACE $DEPLOY_ARGS
./point deploy $GITHUB_WORKSPACE $DEPLOY_ARGS