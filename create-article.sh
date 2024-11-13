#!/bin/bash

# Relative path: ./create-article.sh

# Script to interactively create a new Gatsby blog article.
# Collects metadata, opens editor for content, and saves the article.

# Function to print colored text
print_color() {
  color_code=$1      # Color code for text
  shift              # Shift arguments
  echo -e "\033[${color_code}m$@\033[0m"
}

# Function to prompt user with default value
prompt() {
  local prompt_text="$1"    # Prompt message
  local default_value="$2"  # Default value
  read -p "$(print_color '33' "$prompt_text [$default_value]: ")" input
  echo "${input:-$default_value}"
}

# Start script
print_color '36' "Let's create a new Gatsby article!"

# Collect article metadata
slug=$(prompt "Enter the slug" "")
while [[ -z "$slug" ]]; do
  print_color '31' "Slug cannot be empty."
  slug=$(prompt "Enter the slug" "")
done

title=$(prompt "Enter the title" "Untitled")
date=$(date +"%Y-%m-%d")
author=$(prompt "Enter the author" "Your Name")
description=$(prompt "Enter the description" "")
tags=$(prompt "Enter tags (comma-separated)" "")
featuredImage=$(prompt "Enter path to featured image" "./images/featured.jpg")
imageCaption=$(prompt "Enter image caption" "")

# Display collected metadata for confirmation
print_color '36' "\nArticle Metadata:"
echo "Slug: $slug"
echo "Title: $title"
echo "Date: $date"
echo "Author: $author"
echo "Description: $description"
echo "Tags: $tags"
echo "Featured Image: $featuredImage"
echo "Image Caption: $imageCaption"

confirm=$(prompt "Is this information correct? (y/n)" "y")
if [[ "${confirm,,}" != "y" ]]; then
  print_color '31' "Article creation cancelled."
  exit 1
fi

# Create article directory
article_dir="content/blog/$slug"
mkdir -p "$article_dir/images"

# Open editor to get article content
print_color '36' "Opening editor for article content..."
content_file="$(mktemp)"
${EDITOR:-vim} "$content_file"

# Check if content was provided
if [[ ! -s "$content_file" ]]; then
  print_color '31' "No content provided. Article creation cancelled."
  rm "$content_file"
  exit 1
fi

# Build article front matter
front_matter="---
title: \"$title\"
date: \"$date\"
slug: \"$slug\"
author: \"$author\"
description: \"$description\"
"
if [[ -n "$tags" ]]; then
  IFS=',' read -ra TAGS_ARRAY <<< "$tags"
  front_matter+="tags:\n"
  for tag in "${TAGS_ARRAY[@]}"; do
    tag_trimmed="${tag//\"/}"
    tag_trimmed="${tag_trimmed// /}"
    front_matter+="  - \"$tag_trimmed\"\n"
  done
fi
front_matter+="featuredImage: \"$featuredImage\"
imageCaption: \"$imageCaption\"
---\n"

# Combine front matter and content
article_content="$front_matter\n$(cat "$content_file")"

# Confirm saving the article
save=$(prompt "Do you want to save the article? (y/n)" "y")
if [[ "${save,,}" != "y" ]]; then
  print_color '31' "Article not saved."
  rm "$content_file"
  exit 1
fi

# Save article to file
echo -e "$article_content" > "$article_dir/index.md"
rm "$content_file"
print_color '32' "Article saved to $article_dir/index.md"


