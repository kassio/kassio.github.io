---
layout: post
title: "elixir-ls with coc.nvim"
tags:
  - neovim
  - elixir
  - lsp
---

If you have been followig the neovim udpates about what's to come on nvim
0.4, you're probably excited with the new floating window feature. Well, I got
very excited when I saw this [nvim's
tweet](https://twitter.com/Neovim/status/1101893773561348096)

![neovim-floating-window](/assets/nvim-floating-window.gif)

This tweet shows how [coc.nvim](https://github.com/neoclide/coc.nvim) is getting
ready for the new feature, so I decided to give it a try with elixir-ls.

There's a very good [blog
post](https://www.mitchellhanberg.com/post/2018/10/18/how-to-use-elixir-ls-with-vim/)
about how to use [elixir-ls](https://github.com/JakeBecker/elixir-ls) with
[ale](https://github.com/w0rp/ale), but with this exciting news, I
decided to try it with [coc.nvim](https://github.com/neoclide/coc.nvim).

I like to keep my tools dependencies updated, and when possible without any
manual work to upgrade them. So I decided to try to use my vim plugin manager to
keep elixir-ls also updated, since most of vim's plugin managers are already
tools to download git repositories and most of them has support to do a post
processing after downloading/updating the repo, it should be able to keep
elixir-ls udpated.

My vim plugin manager by choice is [minpac](https://github.com/k-takata/minpac),
so my strategy was to create a function to compile/release elixir-ls after it's
downloaded/updated. There's some boilerplate in the example, but it's just to
keep the code more maintainable:

```vimscript
let g:elixirls = {
  \ 'path': printf('%s/%s', stdpath('config'), 'pack/minpac/opt/elixir-ls'),
  \ }

let g:elixirls.lsp = printf(
  \ '%s/%s',
  \ g:elixirls.path,
  \ 'release/language_server.sh')

function! g:elixirls.compile(...)
  let l:commands = join([
    \ 'mix local.hex --force',
    \ 'mix local.rebar --force',
    \ 'mix deps.get',
    \ 'mix compile',
    \ 'mix elixir_ls.release'
    \ ], '&&')

  echom '>>> Compiling elixir-ls'
  silent call system(l:commands)
  echom '>>> elixir-ls compiled'
endfunction

call coc#config('languageserver', {
  \ 'elixir': {
  \   'command': g:elixirls.lsp,
  \   'trace.server': 'verbose',
  \   'filetypes': ['elixir', 'eelixir']
  \ }
  \})

packadd minpac

call minpac#init()
call minpac#add('k-takata/minpac', { 'type': 'opt' })
call minpac#add('neoclide/coc.nvim', { 'rev': '*', 'do': { -> coc#util#install()} })
call minpac#add('elixir-lsp/elixir-ls', { 'type': 'opt', 'do': { -> g:elixirls.compile() } })
```

With this configuration you'll see the `>>> Compiling elixir-ls` when updating
your vim plugins:

![installing compiling elixir-ls](/assets/coc.nvim.gif)

I don't use [vim-plug](https://github.com/junegunn/vim-plug), but since it's one
of the most popular vim plugins managers I decided to try my approach with it as
well, and the code is actually very similar.
```vimscript
let g:elixirls = {
  \ 'path': printf('%s/%s', stdpath('config'), 'bundle/elixir-ls'),
  \ }

let g:elixirls.lsp = printf(
  \ '%s/%s',
  \ g:elixirls.path,
  \ 'release/language_server.sh')

function! g:elixirls.compile(...)
  let l:commands = join([
    \ 'mix local.hex --force',
    \ 'mix local.rebar --force',
    \ 'mix deps.get',
    \ 'mix compile',
    \ 'mix elixir_ls.release'
    \ ], '&&')

  echom '>>> Compiling elixirls'
  silent call system(l:commands)
  echom '>>> elixirls compiled'
endfunction

call coc#config('languageserver', {
  \ 'elixir': {
  \   'command': g:elixirls.lsp,
  \   'trace.server': 'verbose',
  \   'filetypes': ['elixir', 'eelixir']
  \ }
  \})

call plug#begin('~/.vim/bundle')
Plug 'neoclide/coc.nvim', { 'tag': '*', 'do': { -> coc#util#install() } }
Plug 'JakeBecker/elixir-ls', { 'do': { -> g:elixirls.compile() } }
call plug#end()
```

And that's it.😁
