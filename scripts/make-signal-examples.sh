#!/bin/bash

input_dir="specification/components/schemas/cloudevents"
output_dir="specification/components/schemas/cloudevents/examples"

# Create the output directory if it does not exist
mkdir -p "$output_dir"

# Loop through each file in the input directory with the pattern *Signal.yaml
for input_file in "$input_dir"/*Signal.yaml; do
    # Extract the base name of the file (without the directory and extension)
    base_name=$(basename "$input_file" .yaml)

    # Create the output file name
    output_file="$output_dir/${base_name}.json"

    # Run the Python script and redirect output to the output file
    python scripts/extract_example.py "$input_file" > "$output_file"

    # Check if the Python script was successful
    if [ $? -eq 0 ]; then
        echo "Successfully processed $input_file and wrote to $output_file"
    else
        echo "Error processing $input_file" >&2
    fi
done
