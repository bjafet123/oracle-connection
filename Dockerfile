FROM node:16-alpine

RUN apk --no-cache add \
    python3 \
    make \
    g++ \
    libc6-compat

WORKDIR /usr/src/app

COPY package.json /usr/src/app
COPY package-lock.json /usr/src/app

RUN npm ci --omit=dev

COPY . /usr/src/app

RUN chown -R node:node .
RUN chmod +x ./start.sh

ENV URI_RABBITMQ='amqp://guest:guest@rabbitmq-service.oih-dev-ns.svc.cluster.local'
#ENV URI_RABBITMQ='amqp://guest:guest@rabbitmq-service.oih.svc.cluster.local'

USER node

ENTRYPOINT ["./start.sh"]