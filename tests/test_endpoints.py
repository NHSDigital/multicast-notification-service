"""
See
https://github.com/NHSDigital/pytest-nhsd-apim/blob/main/tests/test_examples.py
for more ideas on how to test the authorization of your API.
"""
import json
import os
import requests
import pytest
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
def pds_change_of_gp_mds_event_mock() -> dict:
    return read_json_file(__file__, "pds-change-of-gp-event-mds.json")


@pytest.mark.smoketest
def test_ping(nhsd_apim_proxy_url):
    resp = requests.get(f"{nhsd_apim_proxy_url}/_ping")
    assert resp.status_code == 200


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
def test_status(nhsd_apim_proxy_url, status_endpoint_auth_headers):
    resp = requests.get(
        f"{nhsd_apim_proxy_url}/_status", headers=status_endpoint_auth_headers
    )
    resp_content = resp.json()

    assert resp.status_code == 200
    assert resp_content.get("commitId") == getenv('SOURCE_COMMIT_ID')


@pytest.mark.smoketest
def test_wait_for_status(nhsd_apim_proxy_url, status_endpoint_auth_headers):
    retries = 0
    resp = requests.get(f"{nhsd_apim_proxy_url}/_status", headers=status_endpoint_auth_headers)
    deployed_commit_id = resp.json().get("commitId")

    while (deployed_commit_id != getenv('SOURCE_COMMIT_ID')
           and retries <= 30
           and resp.status_code == 200
           and resp.json().get("version")):
        resp = requests.get(f"{nhsd_apim_proxy_url}/_status", headers=status_endpoint_auth_headers)
        deployed_commit_id = resp.json().get("commitId")
        retries += 1

    if resp.status_code != 200:
        pytest.fail(f"Status code {resp.status_code}, expecting 200")
    elif retries >= 30:
        pytest.fail("Timeout Error - max retries")
    elif not resp.json().get("version"):
        pytest.fail("version not found")

    assert deployed_commit_id == getenv('SOURCE_COMMIT_ID')


@pytest.mark.nhsd_apim_authorization({"access": "application", "level": "level0"})
def test_app_level0(nhsd_apim_proxy_url, nhsd_apim_auth_headers):
    resp = requests.get(f"{nhsd_apim_proxy_url}", headers=nhsd_apim_auth_headers)
    assert resp.status_code == 401


@pytest.mark.nhsd_apim_authorization({"access": "application", "level": "level3"})
def test_app_level3(nhsd_apim_proxy_url, nhsd_apim_auth_headers):
    resp = requests.get(f"{nhsd_apim_proxy_url}/_ping", headers=nhsd_apim_auth_headers)
    assert resp.status_code == 200


@pytest.mark.nhsd_apim_authorization({"access": "application", "level": "level3"})
def test_events_endpoint_accepts_valid_mds_payload(
    nhsd_apim_proxy_url,
    nhsd_apim_auth_headers,
    pds_change_of_gp_mds_event_mock
):
    nhsd_apim_auth_headers["X-Correlation-ID"] = "ABCD-1234-EEEE"
    resp = requests.post(
        f"{nhsd_apim_proxy_url}/events",
        headers=nhsd_apim_auth_headers,
        json=pds_change_of_gp_mds_event_mock
    )

    assert resp.status_code == 200
    assert resp.json() == {"id": "236a1d4a-5d69-4fa9-9c7f-e72bf505aa5b", "success": "true"}


@pytest.mark.nhsd_apim_authorization({"access": "application", "level": "level3"})
def test_events_endpoint_rejects_invalid_payload(
    nhsd_apim_proxy_url,
    nhsd_apim_auth_headers,
    pds_change_of_gp_mds_event_mock
):
    nhsd_apim_auth_headers["X-Correlation-ID"] = "ABCD-1234-EEEE"
    invalid_payload = pds_change_of_gp_mds_event_mock
    invalid_payload["type"] = "event-type-not-accepted"

    resp = requests.post(
        f"{nhsd_apim_proxy_url}/events",
        headers=nhsd_apim_auth_headers,
        json=pds_change_of_gp_mds_event_mock
    )

    assert resp.status_code == 400
    assert resp.json() == {"validationErrors": {"type": "Please provide a valid event type"}}
