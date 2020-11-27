---
layout: post
title: Test/Lint only what matters
date: 2020-11-27 11:25 +0000
---

## Test/Lint only what _matters_

I mean, every thing matters. But, that's why we have CI, when you're working a
very large project usually is very hard to run all the tests or lint all the
files of the project locally.

But would be nice to run tests/lint only for the files I changed/created on your
feature branch, right?! Right!?

### What files did I change in my feature branch?

I just recently learned that it's quite easy to check what files you changed in
your feature branch with `git diff --name-only master`. Having this power, now
you can easily chain that to your linter or testing tool, like:

```console
git diff --name-only master | grep '.rb' | xargs bundle exec rubocop
```

```console
git diff --name-only master | grep '_spec.rb' | xargs bundle exec rspec
```

That's it. That's the post.

It's very simple, but on the other hand very helpful on large projects. I
created aliases for these examples and my development workflow is faster now. I
hope it help you as well.
