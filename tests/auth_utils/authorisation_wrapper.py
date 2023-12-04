"""Module to further extend APIM auth mocking capabilities"""
from functools import wraps
import os
import requests


def authz_wrapper(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        apigee_base_url: str = kwargs.get("_apigee_app_base_url")
        apigee_test_app: dict = kwargs.get("_create_test_app")

        # Modify the test app to include the required permissions as a custom attribute
        created_test_app_name = apigee_test_app["name"]
        apigee_update_url = f"{apigee_base_url}/{created_test_app_name}"

        key_value_pairs = {
            "attributes": [
                {
                    "name": "permissions",
                    "value": "events:create:pds-change-of-gp-1"
                }
            ]
        }

        update_response = requests.put(
            f"{apigee_update_url}",
            json=key_value_pairs,
            headers={"Authorization": f"Bearer {os.environ['APIGEE_ACCESS_TOKEN']}"}
        )

        update_response.raise_for_status()
        print("hello world")

        return func(*args, **kwargs)

    return wrapper
