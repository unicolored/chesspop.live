#! /bin/bash

set -e

yarn eslint

yarn check

echo "✅ Tests completed"
