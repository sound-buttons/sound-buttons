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
# Sort main.json characters by their total button count (descending).
#
# This script:
# 1. Reads main.json to get all characters
# 2. For each character, counts total buttons across all buttonGroups
# 3. Sorts characters by button count (most buttons first)
# 4. Rewrites main.json with the new order
# 5. Commits the change with a descriptive message
#
# Usage: ./sort-by-button-count.zsh
#
# Requirements: jq, git

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

# Check for required tools
check_dependencies() {
    local missing=()

    if ! command -v jq >/dev/null 2>&1; then
        missing+=("jq")
    fi

    if ! command -v git >/dev/null 2>&1; then
        missing+=("git")
    fi

    if [[ ${#missing[@]} -gt 0 ]]; then
        echo "${RED}ERROR: Missing required tools: ${missing[*]}${RESET}" >&2
        echo "${YELLOW}Please install them before running this script.${RESET}" >&2
        exit 1
    fi
}

# Count total buttons for a character config file
count_buttons() {
    local config_file="$1"

    if [[ ! -f "$config_file" ]]; then
        echo "0"
        return
    fi

    # Sum all buttons across all buttonGroups
    jq '[.buttonGroups[]?.buttons // [] | length] | add // 0' "$config_file"
}

# Main function
main() {
    local main_json="${PROJECT_ROOT}/main.json"

    echo "${GREEN}=== Sort Characters by Button Count ===${RESET}"
    echo ""

    # Check if main.json exists
    if [[ ! -f "$main_json" ]]; then
        echo "${RED}ERROR: main.json not found at ${main_json}${RESET}" >&2
        exit 1
    fi

    # Get list of characters with their config filenames
    local -A button_counts
    local -a character_data=()

    echo "${GRAY}Counting buttons for each character...${RESET}"

    # Read character names and their config URLs
    local characters
    characters=$(jq -r '.[] | "\(.name)|\(.fullConfigURL)"' "$main_json")

    while IFS='|' read -r name config_url; do
        # Extract filename from fullConfigURL (e.g., "assets/configs/yoruka.json" -> "yoruka.json")
        local filename="${config_url:t}"
        local config_file="${PROJECT_ROOT}/${filename}"

        # Count buttons
        local count
        count=$(count_buttons "$config_file")

        button_counts[$name]=$count
        character_data+=("${count}|${name}")

        echo "  ${name}: ${count} buttons"
    done <<< "$characters"

    echo ""

    # Sort by button count (descending)
    local -a sorted_data
    sorted_data=(${(On)character_data})

    echo "${GREEN}Sorted order (by button count, descending):${RESET}"
    local -a sorted_names=()
    local order_message=""
    local rank=1

    for entry in "${sorted_data[@]}"; do
        local count="${entry%%|*}"
        local name="${entry#*|}"
        sorted_names+=("$name")
        echo "  ${rank}. ${name}: ${count} buttons"
        order_message+="  ${rank}. ${name}: ${count} buttons\n"
        ((rank++))
    done

    echo ""

    # Build the new main.json with reordered characters
    echo "${GRAY}Reordering main.json...${RESET}"

    # Create a jq filter to reorder the array
    local jq_filter='.'
    local first=true

    # Build jq command to select items in order
    # We'll create an array of the sorted names and use jq to reorder
    local names_json
    names_json=$(printf '%s\n' "${sorted_names[@]}" | jq -R . | jq -s .)

    # Use jq to reorder: for each name in sorted order, find the matching object
    local new_json
    new_json=$(jq --argjson order "$names_json" '
        . as $orig |
        [$order[] as $name | $orig[] | select(.name == $name)]
    ' "$main_json")

    # Write the new main.json
    echo "$new_json" > "$main_json"

    echo "${GREEN}main.json has been reordered.${RESET}"
    echo ""

    # Check if there are any changes to commit
    cd "$PROJECT_ROOT"
    if git diff --quiet main.json; then
        echo "${YELLOW}No changes detected in main.json. The order is already correct.${RESET}"
        echo "${GREEN}Done! Nothing to commit.${RESET}"
        return 0
    fi

    # Git commit
    echo "${GRAY}Creating git commit...${RESET}"

    git add main.json

    # Create commit message
    local commit_message="chore: sort characters by button count (descending)

Reorder main.json array based on total button count per character.
Characters with more buttons appear first in the list.

New order:
$(echo -e "$order_message")"

    git commit --signoff -m "$commit_message"

    echo ""
    echo "${GREEN}Done! Characters have been sorted by button count.${RESET}"
}

# Run
check_dependencies
main "$@"
