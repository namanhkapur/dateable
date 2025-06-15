
.PHONY: setup
setup:
	npm install -g yarn

.PHONY: deploy-production
deploy-production:
	docker-compose --env-file .env.production down
	-docker rm -f $(docker ps -a -q)
	-docker volume rm $(docker volume ls -q)
	-docker system prune -a -f
	docker compose --env-file .env.production up postgres flyway dateable_server -d

.PHONY: deploy-testing
deploy-testing:
	docker-compose --env-file server/.env.test up test_server
	cd server && make lint && make test

.PHONY: stop-production
stop-production:
	docker-compose --env-file .env.production down

.PHONY: start-production
start-production:
	docker compose --env-file .env.production up -d
