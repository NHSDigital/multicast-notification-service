SHELL := /bin/bash
dirname := $(notdir $(patsubst %/,%,$(CURDIR)))

list:
	@grep '^[^#[:space:]].*:' Makefile

build:
	poetry run docker stop mns_proxy-sandbox 2>/dev/null || true
	poetry run docker build . -t mns_proxy_sandbox_image 

up: 
	poetry run docker run --name mns_proxy-sandbox -d -p 9055:9000 mns_proxy_sandbox_image

down:
	poetry run docker stop mns_proxy-sandbox 2>/dev/null || true
	poetry run docker rm -f mns_proxy-sandbox 2>/dev/null || true			

clean:
	rm -rf ./node_modules

install:
	npm install --dev

update:
	npm update

test:
	NODE_ENV=test npx mocha --reporter spec

test-report:
	NODE_ENV=test npx mocha --reporter mocha-junit-reporter --reporter-options mochaFile=../../reports/tests/$(dirname).xml || true
