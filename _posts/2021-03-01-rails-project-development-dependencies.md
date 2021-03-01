---
layout: post
title: Managing Ruby on Rails development dependencies with asdf and foreman
---

## Why not use docker?

Yeah, I know, docker is cool and everything. But it might happen that you can't
use it or just don't want in this _basic_ project.

## [Why should I care? It's just a _basic_ Rails project?](#should-i-care)

> Even the most basic of the projects will have dependencies

Let's face it, even on a basic Rails project you probably gonna to manage
ruby version, database version, redis version, nodejs/yarn, etc.

## [The Example](#the-example)

The example here will use:

- Ruby on Rails
- postgres
- redis
- yarn

But these ideas can be used with other tools as well.

### [asdf and its plugins](#asdf)

Choose the best option for you to install [`asdf`](https://asdf-vm.com), I'll be
using [`brew`](https://brew.sh)

```console
$ brew install asdf

$ asdf plugin-add ruby     # https://github.com/asdf-vm/asdf-ruby
$ asdf plugin-add yarn     # https://github.com/twuni/asdf-yarn
$ asdf plugin-add redis    # https://github.com/smashedtoatoms/asdf-redis
$ asdf plugin-add postgres # https://github.com/smashedtoatoms/asdf-postgres
```

Now, let's install our system dependencies

```console
$ asdf install ruby 2.7.2
$ asdf install yarn 1.22.5
$ asdf install postgres 12.4
$ asdf install redis 6.0.10
```

### [Creating the project](#creating-the-project)

Set the current ruby version to install rails and create the project:

```console
# Set the ruby version for the current shell only
$ asdf shell ruby 2.7.2

$ gem install rails
$ rails new blog --database=postgres --webpack
```

### [Setting it up](#setting-the-project)

```console
$ cd blog # all the work will be done from within the project now

# Set the ruby version for the project
# This will create a `.tool-versions` file in the project
$ asdf local ruby 2.7.2

# Set the other tools versions
$ asdf local yarn 1.22.5
$ asdf local postgres 12.4
$ asdf local redis 6.0.10
```

You can check the contents of the `.tool-versions`:

```console
$ cat .tool-versions
ruby 2.7.2
yarn 1.22.5
postgres 12.4
redis 6.0.10
```

You can ensure the system dependencies are working by running `asdf install`
from within the project. This will try to install all the dependencies descript
in the `.tool-versions` file.

```console
$ asdf install
postgres 12.4 is already installed
redis 6.0.10 is already installed
ruby 2.7.2 is already installed
yarn 1.22.5 is already installed
```

### [Running the project](#running-the-project)

Ok, now that the system dependencies are installed we need to run the project.
That means that we'll need to start:

1. Rails server: `bundle exec rails server`
1. Webpacker dev server: `bin/webpack-dev-server`
1. Postgres: `pg_ctl start`
1. Redis: `redis-server`

All these, except by the postgres, runs in a foreground process, logging to the
standard output. This means that you would have to either run each of those in
their own shell or all these processes to the background.

Postgres is the only one from these processes that will be started in the
background. To stop it, one can: `pg_ctl stop`.

Another solution would be to use [foreman](https://github.com/ddollar/foreman)
to manage these processes.

First of all we'd need to install foreman:

```console
$ gem install foreman
```

You can read why not put it in the `Gemfile`
[here](https://github.com/ddollar/foreman/wiki/Don't-Bundle-Foreman)

`foreman` uses a `Procfile` to manage the processes, so we could have something
like:

```ruby
rails: bin/rails server
webpacker: bin/webpack-dev-server
redis: redis-server
```

Running `foreman`

```console
$ foreman start
15:07:15 rails.1     | started with pid 80432
15:07:15 webpacker.1 | started with pid 80434
15:07:15 redis.1     | started with pid 80435
```

Cool, now we have most of the processes running in the same shell. We'll also be
able to see the logs for all the processes in the same place, which can be
handy.

Hitting `ctrl-c`, in the foreman shell, will stop all these process by once as
well.

This is nice, but I wasn't happy to have to handle postgres in a different way.
I decided I want to start and stop postgres with the other system dependencies,
this way I wouldn't have to remember to start/stop it manually.

For that, I created a `bin/postgres-local`:

```shell
#!/usr/bin/env bash
#
# This file needs execution permission: `chmod +x bin/postgres-local`

PG_LOG_FILE="log/postgres.log"

stop_postgres() {
  pg_ctl stop
  exit 0
}
trap stop_postgres SIGINT SIGTERM

pg_ctl start -l "${PG_LOG_FILE}" && tail -f "${PG_LOG_FILE}"
```

This very simple script starts postgres, like we did above, but with a few
differences:

1. Defines a file path to log
1. After starting postgres `pg_ctl start -l "${PG_LOG_FILE}"`, it starts
   _reading_ the logfile `tail -f "${PG_LOG_FILE}"`
1. Before starting postgres it creates a [trap](https://linuxhint.com/bash_trap_command/)
   to stop postgres when this script exits `trap 'pg_ctl stop' SIGTERM`


Now adding this to our `Procfile`:

```ruby
rails: bin/rails server
postgres: bin/postgres-local
webpacker: bin/webpack-dev-server
redis: redis-server
```

##### Start services

```console
$ foreman start
15:18:58 rails.1     | started with pid 84286
15:18:58 postgres.1  | started with pid 84287
15:18:58 webpacker.1 | started with pid 84288
15:18:58 redis.1     | started with pid 84289
```

##### Stop services

hitting `ctrl-c` in the `foreman` shell

```console
15:25:41 system      | SIGINT received, starting shutdown

# ... Systems shutting down messages ...

15:25:41 system      | sending SIGTERM to all processes
15:25:41 redis.1     | exited with code 0
15:25:41 webpacker.1 | exited with code 0
15:25:42 postgres.1  | exited with code 0
15:25:42 rails.1     | exited with code 0
```


👋 And that's it! I hope this, or any of this small ideas can be helpful to you. :)
