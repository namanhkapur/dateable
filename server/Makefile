include .env

JEST=node_modules/.bin/jest
TSC=node_modules/.bin/tsc
TSC_WATCH=node_modules/.bin/tsc-watch
ESLINT=node_modules/.bin/eslint
KANEL=node_modules/.bin/kanel
NODEMON=node_modules/.bin/nodemon
MOCHA=node_modules/ts-mocha/bin/ts-mocha

TESTS ?= '__tests__/**/*.test.ts'

NODE_MAX_OLD_SPACE_SIZE_MB=8000

.PHONY: compose
compose:
	cd .. && docker-compose --env-file server/.env up -d postgres

.PHONY: clean
clean:
	rm -rf lib

.PHONY: setup
setup:
	yarn

.PHONY: build
build:
	$(TSC) -b

.PHONY: start
start:
	node lib/index.js

.PHONY: watch
watch: migrate generate-db-types
	ENVFILE=.env ${TSC_WATCH} --onSuccess "node ./lib/index.js"

.PHONY: generate-db-types
generate-db-types: migrate
	$(KANEL)

.PHONY: migrate
migrate:
	cd ../database && flyway -password=${POSTGRES_PASSWORD} -configFiles=flyway.conf,flyway.local.conf -url=${KANEL_FLYWAY_URL} migrate

.PHONY: lint
lint: build
	NODE_OPTIONS="--max-old-space-size=4000" $(ESLINT) "./**/*.ts" --fix --report-unused-disable-directives --cache --cache-strategy content


.PHONY: watch-test
watch-test:
	NODE_ENV="test" NODE_OPTIONS="--max-old-space-size=${NODE_MAX_OLD_SPACE_SIZE_MB}" ENVFILE=.env.test $(NODEMON) -e js,ts -w .mocharc.js -w './src/*' -w './__tests__/*' $(MOCHA) $(TESTS)

.PHONY: test
test: build-test
	echo "Running tests for: $(TESTS)"
	NODE_ENV="test" NODE_OPTIONS="--max-old-space-size=${NODE_MAX_OLD_SPACE_SIZE_MB}" ENVFILE=.env.test $(MOCHA) $(TESTS) --clearCache

.PHONY: circleci-test
circleci-test:
	ENVFILE=.env.test.circleci $(TSC) -b
	NODE_ENV="test" NODE_OPTIONS="--max-old-space-size=${NODE_MAX_OLD_SPACE_SIZE_MB}" ENVFILE=.env.circleci.test $(MOCHA) $(TESTS)

.PHONY: reset-local-db
reset-local-db:
	dropdb -f --if-exists -U a -h localhost -p 5432 test_runner_db
	createdb -U a -h localhost -p 5432 test_runner_db
	dropdb -f --if-exists -U ${POSTGRES_USER} -h localhost circle_test
	createdb -U ${POSTGRES_USER} -h localhost circle_test


backup-db:
	@echo "Backing up DB using dockerized pg_dump..."
	@docker run --rm -v $$PWD:/dumps --env PGPASSWORD=$(POSTGRES_PASSWORD) postgres:15 \
	  pg_dump -h host.docker.internal -p 5434 -U $(POSTGRES_USER) -F c -f /dumps/backup.dump $(POSTGRES_DB)
	@echo "Backup complete."


restore-db:
	@echo "Restoring DB using dockerized pg_restore..."
	@docker run --rm -v $$PWD:/dumps --env PGPASSWORD=$(POSTGRES_PASSWORD) postgres:15 \
	  bash -c "\
	    psql -h host.docker.internal -p 5434 -U $(POSTGRES_USER) -d postgres -c \"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$(POSTGRES_DB)' AND pid <> pg_backend_pid();\" && \
	    dropdb -h host.docker.internal -p 5434 -U $(POSTGRES_USER) $(POSTGRES_DB) && \
	    createdb -h host.docker.internal -p 5434 -U $(POSTGRES_USER) $(POSTGRES_DB) && \
	    pg_restore -h host.docker.internal -p 5434 -U $(POSTGRES_USER) -d $(POSTGRES_DB) -F c /dumps/backup.dump \
	  "
	@echo "Restore complete."


