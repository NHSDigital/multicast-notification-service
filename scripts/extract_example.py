import argparse
import datetime
import yaml
import json
import os
import sys


def date_converter(obj):
    """Date and datetime converter to correctly render dates in json"""
    if isinstance(obj, datetime.datetime):
        return obj.replace(tzinfo=datetime.timezone.utc).isoformat()
    if isinstance(obj, datetime.date):
        return obj.isoformat()
    return obj


def main():
    # Set up command line argument parsing
    parser = argparse.ArgumentParser(
        description="Read a YAML file and output the contents of the example property as a JSON file."
    )
    parser.add_argument("input_file", type=str, help="Path to the input YAML file")
    args = parser.parse_args()

    input_file = args.input_file

    # Check if the file exists
    if not os.path.exists(input_file):
        print(f"Error: The file {input_file} does not exist.", file=sys.stderr)
        return

    # Read the YAML file
    try:
        with open(input_file, "r", encoding="utf-8") as file:
            data = yaml.load(Loader=yaml.FullLoader, stream=file.read())
    except FileNotFoundError as e:
        print(f"Error: Failed to read the file {input_file}. {e}", file=sys.stderr)
        return
    except yaml.YAMLError as e:
        print(
            f"Error: Failed to parse the YAML file {input_file}. {e}", file=sys.stderr
        )
        return

    # Check if the 'example' property exists
    if "example" not in data:
        print(
            f"Error: The file {input_file} does not contain an 'example' property.",
            file=sys.stderr,
        )
        return

    # Extract the 'example' property
    example_data = data["example"]

    # Write the 'example' property to STDOUT as JSON
    try:
        json.dump(example_data, sys.stdout, indent=2, default=date_converter)
        print()  # Ensure a newline after the JSON output
    except json.JSONDecodeError as e:
        print(f"Error: Failed to write JSON to STDOUT. {e}", file=sys.stderr)


if __name__ == "__main__":
    main()
