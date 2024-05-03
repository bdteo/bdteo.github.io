#!/bin/bash
# ./shell-tools/content-gatherer.sh

# Script to gather content from a Gatsby blog and copy it to clipboard.
# Resolves its own directory, moves up to the project directory, and
# collects specific files to append to a temporary file for copying.

# Resolve the script's directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to the project directory (one level up)
cd "$SCRIPT_DIR/.." || exit 1

# Function to check if a command exists in the system
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Determine the appropriate copy command based on the OS
if command_exists pbcopy; then
    copy_command="pbcopy"
elif command_exists xclip; then
    copy_command="xclip -selection clipboard"
else
    echo "Error: Neither pbcopy nor xclip found."
    echo "Please install pbcopy (macOS) or xclip (Linux)."
    exit 1
fi

# Check if 'tree' command is available
if ! command_exists tree; then
    echo "Error: 'tree' command not found. Please install it."
    exit 1
fi

# Create a temporary file to store the gathered content
temp_file=$(mktemp)

# Function to append file content to the temporary file
# Appends the content of the given file to $temp_file
append_content() {
    echo "=== $1 ===" >> "$temp_file"
    tail -n 1000 "$1" >> "$temp_file"
    echo -e "\n\n" >> "$temp_file"
}

# Gather content from the Gatsby blog
echo "Gathering content from your Gatsby blog..."

# Add project structure to the beginning of the temporary file
{
    echo "=== Project Structure ==="
    tree -I 'tests|node_modules|static|.cache'
    echo -e "\n\n"
} > "$temp_file"

# Append Gatsby configuration files to the temporary file
gatsby_files=(
    "gatsby-config.js"
    "gatsby-node.js"
    "gatsby-browser.js"
    "gatsby-ssr.js"
)

for file in "${gatsby_files[@]}"; do
    if [ -f "$file" ]; then
        append_content "$file"
    fi
done

# Append custom components
for file in src/components/*.js; do
    if [ -f "$file" ]; then
        append_content "$file"
    fi
done

# Append page templates
for file in src/templates/*.js; do
    if [ -f "$file" ]; then
        append_content "$file"
    fi
done

# Append pages
for file in src/pages/*.js src/pages/*.tsx; do
    if [ -f "$file" ]; then
        append_content "$file"
    fi
done

# Append styles
for file in src/styles/*.scss; do
    if [ -f "$file" ]; then
        append_content "$file"
    fi
done

# Append the two most recent blog posts
find content/blog -name "index.md" -type f -print0 | \
xargs -0 ls -t | head -n 2 | while read -r file; do
    append_content "$file"
done

# Copy the content of the temporary file to clipboard
$copy_command < "$temp_file"

# Remove the temporary file
rm "$temp_file"

# Inform the user that the content has been copied
echo "Content and project structure have been copied to your clipboard."
echo "You can now paste it into your conversation with LLMs."
