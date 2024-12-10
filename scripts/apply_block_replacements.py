import sys
import json


def apply_nested_replacements(data, replacements=None):
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
                apply_nested_replacements(value, replacements)  # recurse

    elif isinstance(data, list):
        for index, item in enumerate(data):
            apply_nested_replacements(item, replacements)  # recurse


input_data = sys.stdin.read()
json_data = json.loads(input_data)
apply_nested_replacements(json_data)
# send to stdout
print(json.dumps(json_data, indent=2))
