import json
import os
from time import sleep
import pytest
import requests
from os import getenv


def read_json_file(current_file: str, filename: str):
    """
    read a test data json file
    """

    filepath = os.path.join(os.path.dirname(current_file), "data", filename)

    with open(filepath, "r", encoding="utf8") as json_file:
        content = json.loads(json_file.read())

    return content


def _container_not_ready(resp: requests.Response):
    """
    Requests to ECS containers which are still starting up return with a
    HTTP 503 (service unavailable).
    """
    return resp.json().get("checks", {})\
        .get("healthcheck", {})\
        .get("responseCode") == 503


@pytest.mark.smoketest
def test_wait_for_ping(nhsd_apim_proxy_url):
    retries = 0
    resp = requests.get(f"{nhsd_apim_proxy_url}/_ping", timeout=30)
    deployed_commit_id = resp.json().get("commitId")

    while deployed_commit_id != getenv("SOURCE_COMMIT_ID") and retries <= 30:
        resp = requests.get(f"{nhsd_apim_proxy_url}/_ping", timeout=30)
        
        if resp.status_code != 200:
            pytest.fail(f"Status code {resp.status_code}, expecting 200")

        deployed_commit_id = resp.json().get("commitId")
        retries += 1
        sleep(1)

    if retries >= 30:
        pytest.fail("Timeout Error - max retries")

    assert deployed_commit_id == getenv("SOURCE_COMMIT_ID")


@pytest.mark.smoketest
def test_wait_for_status(nhsd_apim_proxy_url, status_endpoint_auth_headers):
    retries = 0
    resp = requests.get(
        f"{nhsd_apim_proxy_url}/_status", headers=status_endpoint_auth_headers, timeout=30
    )

    if resp.status_code != 200:
        # Status should always be 200 we don't need to wait for it
        pytest.fail(f"Status code {resp.status_code}, expecting 200")
    if not resp.json().get("version"):
        pytest.fail("version not found")

    deployed_commit_id = resp.json().get("commitId")

    while deployed_commit_id != getenv("SOURCE_COMMIT_ID") or _container_not_ready(resp) and retries <= 45:
        resp = requests.get(
            f"{nhsd_apim_proxy_url}/_status", headers=status_endpoint_auth_headers, timeout=30
        )

        deployed_commit_id = resp.json().get("commitId")
        retries += 1
        sleep(1)

    if retries >= 45:
        pytest.fail("Timeout Error - max retries")

    assert resp.json().get("status") == "pass"
