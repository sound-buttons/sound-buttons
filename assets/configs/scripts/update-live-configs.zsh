#!/bin/zsh
# Copyright (C) 2025 Jim Chen <Jim@ChenJ.im>, licensed under AGPL-3.0-or-later
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.
# ==================================================================
#
# Fetch live update configs and overwrite local character config files.
#
# This script:
# 1. Reads main.json to get all characters
# 2. For each character, fetches the config from liveUpdateURL
# 3. Overwrites the local config file (e.g., aruma.json)
#
# Usage: ./update-live-configs.zsh
#
# Requirements: curl, jq

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
GRAY='\033[0;90m'
RESET='\033[0m'

# Get the directory where this script is located
SCRIPT_DIR="${0:A:h}"
PROJECT_ROOT="${SCRIPT_DIR:h}"

# Counters for summary
SUCCESS_COUNT=0
FAILED_COUNT=0
SKIPPED_COUNT=0

# Check for required tools
check_dependencies() {
    local missing=()

    if ! command -v curl >/dev/null 2>&1; then
        missing+=("curl")
    fi

    if ! command -v jq >/dev/null 2>&1; then
        missing+=("jq")
    fi

    if [[ ${#missing[@]} -gt 0 ]]; then
        echo "${RED}ERROR: Missing required tools: ${missing[*]}${RESET}" >&2
        echo "${YELLOW}Please install them before running this script.${RESET}" >&2
        exit 1
    fi
}

# Fetch and update a single character config
fetch_and_update_config() {
    local name="$1"
    local live_url="$2"
    local config_url="$3"

    # Extract filename from fullConfigURL (e.g., "assets/configs/yoruka.json" -> "yoruka.json")
    local filename="${config_url:t}"
    local local_config="${PROJECT_ROOT}/${filename}"

    echo -n "  ${name}: "

    # Skip if no liveUpdateURL
    if [[ -z "$live_url" || "$live_url" == "null" ]]; then
        echo "${YELLOW}SKIPPED (no liveUpdateURL)${RESET}"
        ((SKIPPED_COUNT++))
        return 0
    fi

    # Fetch the live config
    local temp_file
    temp_file=$(mktemp)
    local http_code

    http_code=$(curl -s -w "%{http_code}" -o "$temp_file" "$live_url")

    if [[ "$http_code" != "200" ]]; then
        echo "${RED}FAILED (HTTP ${http_code})${RESET}"
        rm -f "$temp_file"
        ((FAILED_COUNT++))
        return 1
    fi

    # Validate JSON
    if ! jq empty "$temp_file" 2>/dev/null; then
        echo "${RED}FAILED (invalid JSON)${RESET}"
        rm -f "$temp_file"
        ((FAILED_COUNT++))
        return 1
    fi

    # Normalize line endings to LF (some sources may have CRLF)
    sed -i 's/\r$//' "$temp_file"

    # Copy raw content directly to preserve Unicode escapes and original formatting
    if cp "$temp_file" "$local_config"; then
        echo "${GREEN}OK${RESET}"
        ((SUCCESS_COUNT++))
    else
        echo "${RED}FAILED (write error)${RESET}"
        ((FAILED_COUNT++))
    fi

    rm -f "$temp_file"
}

# Main function
main() {
    local main_json="${PROJECT_ROOT}/main.json"

    echo "${GREEN}=== Fetch Live Update Configs ===${RESET}"
    echo ""

    # Check if main.json exists
    if [[ ! -f "$main_json" ]]; then
        echo "${RED}ERROR: main.json not found at ${main_json}${RESET}" >&2
        exit 1
    fi

    echo "${GRAY}Fetching configs from liveUpdateURL...${RESET}"
    echo ""

    # Read character data from main.json
    local characters
    characters=$(jq -r '.[] | "\(.name)|\(.liveUpdateURL // "")|\(.fullConfigURL)"' "$main_json")

    while IFS='|' read -r name live_url config_url; do
        fetch_and_update_config "$name" "$live_url" "$config_url" || true
    done <<< "$characters"

    echo ""
    echo "${GREEN}=== Summary ===${RESET}"
    echo "  ${GREEN}Success: ${SUCCESS_COUNT}${RESET}"
    echo "  ${RED}Failed: ${FAILED_COUNT}${RESET}"
    echo "  ${YELLOW}Skipped: ${SKIPPED_COUNT}${RESET}"

    if [[ $FAILED_COUNT -gt 0 ]]; then
        exit 1
    fi
}

# Run
check_dependencies
main "$@"
