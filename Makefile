DEV_OBSERVE_SERVICES=grafana tempo promtail

dev-observe:
	docker-compose up -d $(DEV_OBSERVE_SERVICES)
