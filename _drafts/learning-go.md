---
layout: post
title: Learning Go
---

## Learning Go

On my road to learn go I decided to implement a “repository syncing tool”.

### [Why, you might ask?](#why-you-might-ask)

Well, first of all, this is something that I've been doing for a while. Since my early ages as a
developer I always liked to keep my “stuff” as updated as possible. Working in multiple projects was
easy to get behind some commits in some repositories. To avoid that I wrote a simple bash script to,
given a list of directories to “git pull” in these directories.

Things evolve as much as they need, and that script evolved to also keep local branches updated with
their remotes, which was very useful for shared work.

Then, one day, I had to replace/format my computer, that list of directories wasn’t enough to also
“clone” all my projects, so to not have to do that again, I changed  the list of directories to also
include the git repository url associated with each directory. This way if the directory doesn’t
exist the script would clone the associated git repository instead of "git pull"

Few months/years later... one day I was bored, so I rewrote it in ruby. 🤷

Now, since I'm studying go, which has great support to concurrency, I thought, would be nice to
re-write it in go where each repository is cloned/updated concurrently.

### [The project](#the-project)

The idea is to have a "repos.json" file like:

```json
[
  {
    "name": "a project",                             // a name for reference
    "local": "$HOME/src/project",                    // the path where the project will be cloned
    "remote": "https://gitlab.com/kassio/a-project"  // the project url
  },
  // ...
]
```
