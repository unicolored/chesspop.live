#! /bin/bash

set -e

DEV_BRANCH="next"
PUB_BRANCH="main"

# Check if current git branch is "develop"
if [[ $(git rev-parse --abbrev-ref HEAD) != "${DEV_BRANCH}" ]]; then
  echo "⚠️ You must be on the develop branch to run this script."
  exit 1
fi

# Ensure NEW_VERSION is set, else prompt for it
CURRENT_VERSION=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')
echo "Current version is ${CURRENT_VERSION}"
read -p "Enter new version: " NEW_VERSION

if [[ -z "${NEW_VERSION}" ]]; then
  NEW_VERSION="${CURRENT_VERSION}"
fi

echo "🚀 VERSION: ${NEW_VERSION}"

bash script/test.sh

git add --all && git commit -m "Preparing new release ${NEW_VERSION}..." || true
NEXT_RELEASE="${NEW_VERSION}" # Bump manually (ex. 18.2.0)
git flow release start "${NEXT_RELEASE}"
sed -i '' "s/\"version\": \".*\"/\"version\": \"${NEXT_RELEASE}\"/g" package.json
yarn set version stable && yarn install && npx update-browserslist-db@latest

PACKAGE_VERSION=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')
echo "✋ $PACKAGE_VERSION"

git add --all && git commit -am "Bumped to ${PACKAGE_VERSION}" || true
GIT_TAG="v${PACKAGE_VERSION}"
git tag -d "${GIT_TAG}" || true
GIT_MERGE_AUTOEDIT=no git flow release finish "${PACKAGE_VERSION}" -m "⭐️ Releasing version tag 🏷️ ${GIT_TAG}" -T "${GIT_TAG}"

echo "Pushing ${DEV_BRANCH}."
git push origin ${DEV_BRANCH}

echo "Pushing ${PUB_BRANCH}."
git push origin ${PUB_BRANCH}

echo "Pushing --tags."
git push origin --tags || true

