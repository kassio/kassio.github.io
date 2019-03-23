---
layout: post
title: "Parsing bash arguments recursively"
tags:
  - bash
  - recursion
---

# The problem

I'm a lazy developer, who tries to create scripts to automatize most of my daily
mechanical activities. And because of that I have many many scripts on my
[dotfiles](https://github.com/kassio/dotfiles).

Some of my scripts require arguments and often, due to my lack of memory, I had
to research the best way to part arguments in bash. Usually I need to parse
arguments in the following format:

```console
$ ./whatever
option_a:  | option_b: DEFAULT | option_c:

$ ./whatever -a A
option_a: A | option_b: DEFAULT | option_c:

$ ./whatever -b B
option_a:  | option_b: B | option_c:

$ ./whatever -b B -a A -c C
option_a: A | option_b: B | option_c: C

$ ./whatever -b B -a A -c C other values right here
option_a: A | option_b: B | option_c: C
other values right here
```

# The usual solution

When researching usually I [found
solutions](https://medium.com/@Drew_Stokes/bash-argument-parsing-54f3b81a6a8f)
like

```bash
#!/bin/bash
PARAMS=""
while (( "$#" )); do
  case "$1" in
    -f|--flag-with-argument)
      FARG=$2
      shift 2
      ;;
    --) # end argument parsing
      shift
      break
      ;;
    -*|--*=) # unsupported flags
      echo "Error: Unsupported flag $1" >&2
      exit 1
      ;;
    *) # preserve positional arguments
      PARAMS="$PARAMS $1"
      shift
      ;;
  esac
done
# set positional arguments in their proper place
eval set -- "$PARAMS"
```

This is a great solution, it basically loops through the arguments checking if
the first one matches with any expected argument key (`-key`), fetch its value
and remove it from the list of arguments and move to the next.

# The recursive solution

The example above is a very common pattern when working with linked lists. When
studying [Elixir](https://elixir-lang.org) I saw this pattern many times in
different examples [using
recursion](https://elixir-lang.org/getting-started/recursion.html#reduce-and-map-algorithms).
That's when I thought that maybe I could use recursion to parse also my scripts
list arguments too.

So, now that you know my motivation, this is the code

```bash
#!/usr/bin/env bash

option_a=""
option_b="DEFAULT"
option_c=""
message=""

function parse_args() {
  case $1 in
    -a|--option-a)
      option_a=$2
      shift 2
      parse_args $@
      ;;

    -b|--option-b)
      option_b=$2
      shift 2
      parse_args $@
      ;;

    -c|--option-c)
      option_c=$2
      shift 2
      parse_args $@
      ;;

    *)
      message="$@"
      ;;
  esac
}

function whatever() {
  parse_args $@

  echo "option_a: ${option_a} | option_b: ${option_b} | option_c: ${option_c}"
  echo "$message"
}

whatever $@
```

I think this is neat solution because having a function to parse the arguments
makes your code more explicit and better split. Your main function doesn't know
how the arguments are parsed and parsing the arguments doesn't have any other
dependency. This way, each of the functions, on this example, has a single
responsibility, following the [Single Responsibility
Principle](https://en.wikipedia.org/wiki/Single_responsibility_principle).
