#!/bin/bash

# Exit on error
set -e

# Check if a version bump type is provided
if [ -z "$1" ]; then
  echo "Usage: ./release.sh [patch|minor|major]"
  exit 1
fi

VERSION_TYPE=$1

# Ensure the working directory is clean
if [[ -n $(git status --porcelain) ]]; then
  echo "Error: Your working directory is not clean. Commit or stash your changes before releasing."
  exit 1
fi

# Bump version
NEW_VERSION=$(npm version $VERSION_TYPE)

# Push changes
git push origin main --tags

# Publish to npm
npm publish

echo "✅ Release $NEW_VERSION published successfully!"