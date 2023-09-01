#!/bin/bash

# Define the folders to search in
folders=("app" "config" "database" "tests")

# Loop through each folder
for folder in "${folders[@]}"; do
  # Find all PHP files in the folder
  find "$folder" -name "*.php" | while read -r file; do
    # Create a temp file to store changes
    tmpfile=$(mktemp)

    # Initialize a flag to know if declare(strict_types=1); already exists
    has_strict_types=0

    # Read file line by line to check for existing strict types and to write to tmpfile
    while IFS= read -r line; do
      # Check if declare(strict_types=1); already exists
      if [[ "$line" == *"declare(strict_types=1);"* ]]; then
        has_strict_types=1
      fi

      # Write the line to tmpfile
      echo "$line" >> "$tmpfile"
    done < "$file"

    # Now, let's process the tmpfile to add strict types if needed, and add final to classes
    tmpfile_processed=$(mktemp)
    inside_php_tag=0
    while IFS= read -r line; do
      # Detect PHP open tag
      if [[ "$line" == *"<?php"* ]]; then
        inside_php_tag=1
        echo "$line" >> "$tmpfile_processed"
        continue
      fi

      # Add declare(strict_types=1); if inside PHP tag and not added yet
      if [[ "$inside_php_tag" -eq 1 && "$has_strict_types" -eq 0 ]]; then
        echo -e "\ndeclare(strict_types=1);" >> "$tmpfile_processed"
        has_strict_types=1  # Set it to 1 so we don't add it again
      fi

      # Add final to class if not abstract or final
      if [[ "$line" == "class "* && "$line" != "final class "* && "$line" != "abstract class "* ]]; then
        echo "final $line" >> "$tmpfile_processed"
      else
        echo "$line" >> "$tmpfile_processed"
      fi
    done < "$tmpfile"

    # Replace original file with modified temp file
    mv "$tmpfile_processed" "$file"

    # Remove the intermediate temp file
    rm "$tmpfile"
  done
done

echo "Script complete!"
