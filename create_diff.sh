#!/bin/bash

# Define the output file name
OUTPUT_FILE="diff.txt"

# Define the AI prompt using a heredoc for clarity
# This prompt instructs the AI on how to process the subsequent git diff
cat > "$OUTPUT_FILE" << EOF
Your task is to analyze the following code changes (provided in git diff format below) and break them down into multiple logical Git commits.

For each proposed commit, provide:
1. A commit message that strictly follows the Conventional Commits specification.
2. The specific code patch (diff) corresponding ONLY to that commit.

Commit Message Format:
The message must start with one of the following types, followed by a colon and a space, then a concise description of the change:
- Feat: A new feature (user-facing)
- Fix: A bug fix (user-facing)
- Docs: Changes to documentation (README, comments, etc.)
- Style: Code style or formatting changes (whitespace, semicolons, etc. - no functional change)
- Perf: A code change that improves performance
- Test: Adding missing tests or correcting existing tests
- Chore: Other changes that don't modify src or test files (build process, auxiliary tools, etc.)
- Refactor: A code change that neither fixes a bug nor adds a feature (restructuring code)

Example Commit Message:
Fix: Resolve issue where user login fails on invalid input

Example Output Structure for the AI:
--- Commit 1 ---
Commit Message: Feat: Add user profile editing functionality
Patch:
[Diff content for commit 1]

--- Commit 2 ---
Commit Message: Docs: Update README with profile editing instructions
Patch:
[Diff content for commit 2]
---

Now, analyze the git diff provided below and generate the commits as requested.

--- GIT DIFF START ---
EOF

# Append the output of 'git diff' (unstaged changes) to the file
# If you want staged changes instead, use 'git diff --staged >> "$OUTPUT_FILE"'
git diff >> "$OUTPUT_FILE"

# Check if git diff produced any output. If not, the file might just contain the prompt.
if [ $? -eq 0 ]; then
    echo "Successfully generated '$OUTPUT_FILE' with AI prompt and git diff."
    # Optional: Check if the diff part is empty
    if ! git diff --quiet; then
        echo "Git diff content was added."
    else
        echo "Warning: No unstaged changes detected by 'git diff'. '$OUTPUT_FILE' contains only the prompt."
    fi
else
    echo "Error: Failed to run 'git diff'. Are you in a git repository?"
    # Optional: Remove the file if git diff failed to avoid leaving an incomplete file
    # rm "$OUTPUT_FILE"
    exit 1
fi

exit 0