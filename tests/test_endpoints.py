"""
See
https://github.com/NHSDigital/pytest-nhsd-apim/blob/main/tests/test_examples.py
for more ideas on how to test the authorization of your API.
"""
import json
import os
from typing import List
import pytest
import requests
import uuid
from os import getenv


def read_json_file(current_file: str, filename: str):
    """
    read a test data json file
    """

    filepath = os.path.join(os.path.dirname(current_file), "data", filename)

    with open(filepath, "r", encoding='utf8') as json_file:
        content = json.loads(json_file.read())

    return content


@pytest.fixture
def mds_event_list() -> List[dict]:
    return [
        read_json_file(__file__, "pds-change-of-gp-event-mds.json"),
        read_json_file(__file__, "pds-death-event-mds.json"),
        read_json_file(__file__, "nhs-number-change-event-mds.json"),
        read_json_file(__file__, "immunisation-vaccination-event-mds.json"),
    ]


@pytest.mark.smoketest
def test_wait_for_ping(nhsd_apim_proxy_url):
    retries = 0
    resp = requests.get(f"{nhsd_apim_proxy_url}/_ping")
    deployed_commit_id = resp.json().get("commitId")

    while (deployed_commit_id != getenv('SOURCE_COMMIT_ID')
           and retries <= 30
           and resp.status_code == 200):
        resp = requests.get(f"{nhsd_apim_proxy_url}/_ping")
        deployed_commit_id = resp.json().get("commitId")
        retries += 1

    if resp.status_code != 200:
        pytest.fail(f"Status code {resp.status_code}, expecting 200")
    elif retries >= 30:
        pytest.fail("Timeout Error - max retries")

    assert deployed_commit_id == getenv('SOURCE_COMMIT_ID')


@pytest.mark.smoketest
def test_wait_for_status(nhsd_apim_proxy_url, status_endpoint_auth_headers):
    retries = 0
    resp = requests.get(f"{nhsd_apim_proxy_url}/_status", headers=status_endpoint_auth_headers,
                        timeout=30)
    deployed_commit_id = resp.json().get("commitId")

    while (
            deployed_commit_id != getenv('SOURCE_COMMIT_ID') or _container_not_ready(resp)
            and resp.status_code == 200
            and resp.json().get("version")):
        resp = requests.get(f"{nhsd_apim_proxy_url}/_status", headers=status_endpoint_auth_headers,
                            timeout=30)
        deployed_commit_id = resp.json().get("commitId")
        retries += 1

    if resp.status_code != 200:
        pytest.fail(f"Status code {resp.status_code}, expecting 200")
    elif retries >= 30:
        pytest.fail("Timeout Error - max retries")
    elif not resp.json().get("version"):
        pytest.fail("version not found")

    assert resp.json().get("status") == "pass"


def _container_not_ready(resp: requests.Response):
    return resp.json().get('checks', {})\
        .get('healthcheck', {})\
        .get('responseCode') == 503


@pytest.mark.nhsd_apim_authorization({"access": "application", "level": "level0"})
def test_app_level0(nhsd_apim_proxy_url, nhsd_apim_auth_headers):
    resp = requests.get(f"{nhsd_apim_proxy_url}", headers=nhsd_apim_auth_headers)
    assert resp.status_code == 401


@pytest.mark.nhsd_apim_authorization({"access": "application", "level": "level3"})
def test_app_level3(nhsd_apim_proxy_url, nhsd_apim_auth_headers):
    resp = requests.get(f"{nhsd_apim_proxy_url}/_ping", headers=nhsd_apim_auth_headers)
    assert resp.status_code == 200


@pytest.mark.nhsd_apim_authorization({"access": "application", "level": "level3"})
def test_events_endpoint_accepts_valid_mds_payload_pds_events(
    nhsd_apim_proxy_url,
    nhsd_apim_auth_headers,
    mds_event_list,
    _apigee_app_base_url,
    _create_test_app
):
    created_test_app_name = _create_test_app["name"]
    apigee_update_url = f"{_apigee_app_base_url}/{created_test_app_name}"

    key_value_pairs = {
        "attributes": [
            {
                "name": "permissions",
                "value": ",".join([
                    "events:create:pds-change-of-gp-1",
                    "events:create:pds-death-notification-1",
                    "events:create:nhs-number-change-1",
                    "events:create:imms-vaccinations-1",
                ])
            }
        ]
    }

    update_response = requests.put(
        f"{apigee_update_url}",
        json=key_value_pairs,
        headers={"Authorization": f"Bearer {os.environ['APIGEE_ACCESS_TOKEN']}"}
    )
    update_response.raise_for_status()

    for mds_event in mds_event_list:
        nhsd_apim_auth_headers["X-Correlation-ID"] = f"apim-smoketests-{uuid.uuid4()}"
        retries = 0

        while retries < 5:
            resp = requests.post(
                f"{nhsd_apim_proxy_url}/events",
                headers=nhsd_apim_auth_headers,
                json=mds_event
            )

            if resp.status_code == 403:
                retries = retries + 1
                continue

            break

        assert resp.status_code == 200
        assert resp.json() == {"id": mds_event["id"]}
