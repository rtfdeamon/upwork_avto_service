DEV_OBSERVE_SERVICES=grafana tempo promtail

dev-observe:
	docker-compose up -d $(DEV_OBSERVE_SERVICES)

dev-py:
	docker-compose up -d db redis localstack py-api

dev-py-worker:
	docker-compose up -d py-worker
