#!/usr/bin/env bash
# Rebuilds the vendored React Advanced Odontogram from upstream + patches/.
#
#   packages/react-advanced-odontogram/build.sh
#
# 1. clones ZoliQua/React-Advanced-Odontogram at UPSTREAM_COMMIT,
# 2. applies patches/*.patch with `git am` (history kept, ready for PRs),
# 3. runs the library's test suite (skip with SKIP_TESTS=1) and `build:lib`,
# 4. replaces ./dist with the build (source maps dropped) and refreshes LICENSE.
#
# Bump "version" in package.json (2.6.0-dalidoc.N) when the patches change.
set -euo pipefail

UPSTREAM_REPO="https://github.com/ZoliQua/React-Advanced-Odontogram.git"
UPSTREAM_COMMIT="f3d80c4a06c5880a49a9863ac3945233f12eca15"

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

git clone --quiet --filter=blob:none "$UPSTREAM_REPO" "$work/src"
cd "$work/src"
git checkout --quiet "$UPSTREAM_COMMIT"
git -c user.name="DaliDoc build" -c user.email="build@dalidoc.invalid" am --quiet "$here"/patches/*.patch

npm ci --no-audit --no-fund
if [[ "${SKIP_TESTS:-0}" != "1" ]]; then npx vitest run --reporter=dot; fi
npm run build:lib

rm -rf "$here/dist"
mkdir -p "$here/dist"
(cd dist && find . -type f ! -name '*.map' -exec cp --parents {} "$here/dist/" \;)
# The maps are not vendored, so drop the comments that point at them.
find "$here/dist" -name '*.js' -exec sed -i '/^\/\/# sourceMappingURL=/d' {} +
cp LICENSE "$here/LICENSE"
echo "Vendored $(git describe --always) → $here/dist"
