---
layout: post
title: "Parsing bash arguments recursively"
---

# The problem

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

```bash
#!/usr/bin/env bash

option_a=""
option_b="DEFAULT"
option_c=""

function parse_args() {
  case $1 in
    -a|--option-a)
      shift
      option_a=$1
      shift
      parse_args $@
      ;;

    -b|--option-b)
      shift
      option_b=$1
      shift
      parse_args $@
      ;;

    -c|--option-c)
      shift
      option_c=$1
      shift
      parse_args $@
      ;;

    *)
      do_whatever $@
      ;;
  esac
}

function do_whatever() {
  echo "option_a: ${option_a} | option_b: ${option_b} | option_c: ${option_c}"
  echo "$@"
}

parse_args $@
```
