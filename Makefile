SHELL=/bin/bash -euo pipefail

#Installs dependencies using poetry.
install-python: maybe-init-venv
	poetry install --sync

#Installs dependencies using npm.
install-node:
	npm install --legacy-peer-deps
	cd sandbox && npm install --legacy-peer-deps

#Configures Git Hooks, which are scripts that run given a specified event.
install-hooks:
	cp scripts/pre-commit .git/hooks/pre-commit

#Condensed Target to run all targets above.
install: install-hooks install-node install-python

#Install tooling using asdf
install-tools:
	scripts/install-tools.sh "python java nodejs poetry"

maybe-init-venv:
	@if command -v asdf &> /dev/null; then \
  		poetry env use $$(asdf current python | grep python | sed -e 's/ \+/ /g' | cut -d' ' -f 2); \
	fi

#Run the npm linting script (specified in package.json). Used to check the syntax and formatting of files.
lint: lint-vacuum
	npm run lint
	find . -name '*.py' -not -path '**/.venv/*' | xargs poetry run flake8

lint-vacuum:
	docker run --rm -v ./specification:/work:ro dshanley/vacuum lint -n info --ignore-file vacuum-ignore.yaml  multicast-notification-service.yaml -d

lint-vacuum-html:
	docker run --user $$(id -u):$$(id -g) --rm -v ./specification:/work dshanley/vacuum html-report multicast-notification-service.yaml vacuum-report.html

#Removes build/ + dist/ directories
clean:
	rm -rf build
	rm -rf dist

#Creates the fully expanded OAS spec in json
publish: clean
	mkdir -p build
	npm run publish 2> /dev/null

#Serves the published OAS spec locally
serve:
	npm run serve

#Runs build proxy script
build-proxy:
	scripts/build_proxy.sh

#Files to loop over in release
_dist_include="pytest.ini poetry.lock poetry.toml pyproject.toml Makefile build/. tests"

#Create /dist/ sub-directory and copy files into directory
release: clean publish build-proxy
	mkdir -p dist
	for f in $(_dist_include); do cp -r $$f dist; done
	cp ecs-proxies-deploy.yml dist/ecs-deploy-sandbox.yml
	cp ecs-proxies-deploy.yml dist/ecs-deploy-internal-qa-sandbox.yml
	cp ecs-proxies-deploy.yml dist/ecs-deploy-internal-dev-sandbox.yml

# Regenerate JSON example payloads from signal schemas (extract from YAML-formatted JSON schemas)
# and write out as JSON files
signal-examples:
	scripts/make-signal-examples.sh

#################
# Test commands #
#################

TEST_CMD := @APIGEE_ACCESS_TOKEN=$(APIGEE_ACCESS_TOKEN) \
		poetry run pytest -v \
		--color=yes \
		--api-name=multicast-notification-service \
		--proxy-name=$(PROXY_NAME) \
		-s

PROD_TEST_CMD := $(TEST_CMD) \
		--apigee-app-id=$(APIGEE_APP_ID) \
		--apigee-organization=nhsd-prod \
		--status-endpoint-api-key=$(STATUS_ENDPOINT_API_KEY) \
		-s

#Command to run end-to-end smoketests post-deployment to verify the environment is working
smoketest:
	$(TEST_CMD) \
	--junitxml=smoketest-report.xml \
	-m smoketest

test:
	$(TEST_CMD) \
	--junitxml=test-report.xml \

smoketest-prod:
	$(PROD_TEST_CMD) \
	--junitxml=smoketest-report.xml \
	-m smoketest

test-prod:
	$(PROD_TEST_CMD) \
	--junitxml=test-report.xml \

docker-build:
	make -C sandbox build

up:
	make -C sandbox up

down:
	make -C sandbox down

update:
	poetry update
	npm update
	make -C sandbox update
