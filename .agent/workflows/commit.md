---
description: Commit the current code changes
---

// turbo-all
This workflow wraps an agentic task in a git commit and push cycle.
1.  **Check for Git Repository**:
    *   Run `git rev-parse --is-inside-work-tree` to verify if the current directory is a git repository.
    *   If the command fails or returns `false`, inform the user that no git repository was detected and DO NOT PROCEED FURTHER
2.  **Commit Changes (If in Git Repo)**:
    *   Run `git add .` to stage all changes.
    *   Craft a concise and descriptive commit message based on the work performed.
    *   Run `git commit -m "[commit message]"`.
4.  **Push Changes (If in Git Repo)**:
    *   Run `git push` to upload the changes to the remote repository.
    *   Inform the user that the task was completed and the changes were committed and pushed.