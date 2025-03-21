import json
import os
import pytest
import requests
from time import sleep
import uuid


@pytest.fixture
def mns_test_signal_event():
    return {
        "specversion": "1.0",
        "id": str(uuid.uuid4()),
        "source": "uk.nhs.multicast-notification-service",
        "type": "mns-test-signal-1",
        "time": "2020-06-01T13:00:00Z",
        "dataref": "https://int.api.service.nhs.uk/multicast-notification-service/FHIRR4Response",
        "subject": "9911003906"
    }


@pytest.mark.parametrize("proxy_path", ["events", "subscriptions"])
@pytest.mark.nhsd_apim_authorization({"access": "application", "level": "level0"})
def test_api_not_accessible_by_api_key(proxy_path, nhsd_apim_proxy_url, nhsd_apim_auth_headers):
    resp = requests.get(
        f"{nhsd_apim_proxy_url}/{proxy_path}",
        headers=nhsd_apim_auth_headers,
        timeout=30
    )
    assert resp.status_code == 401


@pytest.mark.parametrize(
    "attributes_to_update, expected_status_code, expected_error",
    [
        (
            [
                {
                    "name": "apim-app-flow-vars",
                    "value": json.dumps({"mns": {"permissions": "events:create:mns-test-signal-1"}})
                },
                {
                    "name": "product-id",
                    "value": "P-MNS-TST"
                },
                {
                    "name": "product-device-id",
                    "value": str(uuid.uuid4())
                },
            ],
            200,
            None,
        ),
        (
            [
                {
                    "name": "product-id",
                    "value": "P-MNS-TST"
                },
                {
                    "name": "product-device-id",
                    "value": str(uuid.uuid4()),
                },
            ],
            403,
            {"errors": "Unauthorised"},
        ),
        (
            [
                {
                    "name": "apim-app-flow-vars",
                    "value": json.dumps({"mns": {"permissions": "events:create:mns-test-signal-1"}}),
                },
                {
                    "name": "product-device-id",
                    "value": str(uuid.uuid4()),
                },
            ],
            502,
            {"message": "Internal server error"},
        ),
        (
            [
                {
                    "name": "apim-app-flow-vars",
                    "value": json.dumps({"mns": {"permissions": "events:create:mns-test-signal-1"}})
                },
                {
                    "name": "product-id",
                    "value": "P-MNS-TST",
                },
            ],
            502,
            {"message": "Internal server error"},
        ),
    ]
)
@pytest.mark.nhsd_apim_authorization({"access": "application", "level": "level3"})
def test_post_event(
    nhsd_apim_proxy_url,
    nhsd_apim_auth_headers,
    mns_test_signal_event,
    _apigee_app_base_url,
    _create_test_app,
    attributes_to_update,
    expected_status_code,
    expected_error
):
    # Update client app via Apigee with necessary custom attributes
    created_test_app_name = _create_test_app["name"]
    apigee_update_url = f"{_apigee_app_base_url}/{created_test_app_name}"

    update_response = requests.put(
        f"{apigee_update_url}",
        json={"attributes": attributes_to_update},
        headers={"Authorization": f"Bearer {os.environ['APIGEE_ACCESS_TOKEN']}"}
    )
    update_response.raise_for_status()

    # POST event to /events endpoint
    nhsd_apim_auth_headers["X-Correlation-ID"] = f"apim-smoketests-{uuid.uuid4()}"
    nhsd_apim_auth_headers["Content-Type"] = "application/cloudevents+json"

    retries = 0
    while retries < 5:
        resp = requests.post(
            f"{nhsd_apim_proxy_url}/events",
            headers=nhsd_apim_auth_headers,
            json=mns_test_signal_event
        )

        if resp.status_code != expected_status_code:
            retries = retries + 1
            sleep(1)
            continue

        break

    assert resp.status_code == expected_status_code, resp.text
    assert resp.json() == expected_error if expected_error else {"id": mns_test_signal_event["id"]}
