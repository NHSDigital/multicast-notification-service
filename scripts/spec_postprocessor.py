import sys
import json

"""
Postprocessor for the multicast-notification-service OpenAPI spec transform.
Called via npm run publish to run against build/multicast-notification-service.json.
"""


def apply_replacements(data, replacements=None):
    """
    Applies replacements stated in "blockReplace" items found in the json.
    Replacements are applied to both the blockReplace siblings and their children.
    Each replacement token is in the form of [[token]].
    The blockReplace items themselves are removed during processing.
    """

    if isinstance(data, dict):
        if "blockReplace" in data:
            replacements = data["blockReplace"]
            del data["blockReplace"]

        for key, value in data.items():
            if isinstance(value, str) and replacements:
                for placeholder, replacement in replacements.items():
                    value = value.replace(f"[[{placeholder}]]", replacement)
                data[key] = value
            else:
                apply_replacements(value, replacements)  # recurse

    elif isinstance(data, list):
        for _, item in enumerate(data):
            apply_replacements(item, replacements)  # recurse


input_data = sys.stdin.read()
json_data = json.loads(input_data)
apply_replacements(json_data)
# send to stdout
print(json.dumps(json_data, indent=2))
