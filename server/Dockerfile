FROM node:18.13

ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.2/dumb-init_1.2.2_x86_64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init
ENTRYPOINT ["dumb-init", "--"]

# Copy packages
COPY --chown=node:node server server
COPY .env.production server/.env.production

WORKDIR /server

# RUN cd ~ && wget -qO- https://repo1.maven.org/maven2/org/flywaydb/flyway-commandline/9.16.3/flyway-commandline-9.16.3-linux-x64.tar.gz | tar xvz && export PATH=${PATH}:${PWD}/flyway-9.16.3/flyway

# RUN cd ../database && ~/flyway-9.16.3/flyway

RUN yarn install

RUN make build

ENV NODE_ENV=production

CMD ["node",  "--max-old-space-size=3584", "lib/index.js"]

EXPOSE 80
EXPOSE 8888
EXPOSE 8443
