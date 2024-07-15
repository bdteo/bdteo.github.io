#!/bin/bash

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if pbcopy exists (macOS), if not use xclip (Linux)
if command_exists pbcopy; then
    copy_command="pbcopy"
elif command_exists xclip; then
    copy_command="xclip -selection clipboard"
else
    echo "Error: Neither pbcopy nor xclip found. Please install one of them."
    exit 1
fi

# Check if tree command exists
if ! command_exists tree; then
    echo "Error: 'tree' command not found. Please install it."
    exit 1
fi

# Create a temporary file
temp_file=$(mktemp)

# Function to append content to the temporary file
append_content() {
    {
        echo "=== $1 ===";
        tail -n 1000 "$1";
        echo -e "\n\n";
    } >> "$temp_file"
}

# Start gathering content
echo "Gathering content from your Gatsby blog..."

# Add tree structure to the beginning of the file
{
    echo "=== Project Structure ===";
    tree -I 'tests|node_modules|static|.cache';
    echo -e "\n\n";
} > "$temp_file"

# Gatsby configuration files
for file in gatsby-config.js gatsby-node.js gatsby-browser.js gatsby-ssr.js; do
    if [ -f "$file" ]; then
        append_content "$file"
    fi
done

# Custom components
for file in src/components/*.js; do
    if [ -f "$file" ]; then
        append_content "$file"
    fi
done

# Page templates
for file in src/templates/*.js; do
    if [ -f "$file" ]; then
        append_content "$file"
    fi
done

# Pages
for file in src/pages/*.js src/pages/*.tsx; do
    if [ -f "$file" ]; then
        append_content "$file"
    fi
done

# Styles
for file in src/styles/*.scss; do
    if [ -f "$file" ]; then
        append_content "$file"
    fi
done

# Blog posts (limited to 5 most recent to avoid overwhelming)
find content/blog -name "index.md" -type f -print0 | xargs -0 ls -t | head -n 5 | while read -r file; do
    append_content "$file"
done

# Copy the content to clipboard
$copy_command < "$temp_file"

# Clean up
rm "$temp_file"

echo "Content, including the project structure, has been copied to your clipboard."
echo "You can now paste it into your conversation with Claude or other LLMs."
