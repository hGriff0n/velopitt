---
description: Perform a task and wrap it in a git commit and push if a repository exists
---

// turbo-all
This workflow wraps an agentic task in a git commit and push cycle.
1.  **Check for Git Repository**:
    *   Run `git rev-parse --is-inside-work-tree` to verify if the current directory is a git repository.
    *   If the command fails or returns `false`, inform the user that no git repository was detected and proceed to step 2 ONLY (skipping commit/push).
2.  **Execute the Requested Task**:
    *   Perform the task as requested by the user.
    *   Ensure all necessary changes are made to the codebase.
3.  **Commit Changes (If in Git Repo)**:
    *   If a git repository was detected in step 1:
        *   Run `git add .` to stage all changes.
        *   Craft a concise and descriptive commit message based on the work performed.
        *   Run `git commit -m "[commit message]"`.
4.  **Push Changes (If in Git Repo)**:
    *   If a git repository was detected in step 1:
        *   Run `git push` to upload the changes to the remote repository.
        *   Inform the user that the task was completed and the changes were committed and pushed.
5.  **Completion Notification**:
    *   If not in a git repository, inform the user that the task was completed but changes were not committed as no git repository was found.
