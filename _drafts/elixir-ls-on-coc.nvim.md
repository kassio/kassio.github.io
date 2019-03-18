---
layout: post
title: "elixir-ls with coc.nvim"
---

There's a very good [blog post](https://www.mitchellhanberg.com/post/2018/10/18/how-to-use-elixir-ls-with-vim/) about how to use [elixir-ls]() with [ale]().

But, if you have been followig the neovim udpates about what's to come on nvim 0.4, you're probably excited with the new floating window feature. Well, I got very excited when I saw this [nvim's tweet](https://twitter.com/Neovim/status/1101893773561348096)

![neovim-floating-window](/assets/nvim-floating-window.gif)

This tweet shows how [coc.nvim]() is getting ready for the new feature, so I decided to give it a try with elixir-ls.

With [vim-plug](https://github.com/junegunn/vim-plug)
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
  call system(l:commands)
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

With [minpac]()

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

  echom '>>> Compiling elixirls'
  call system(l:commands)
  echom '>>> elixirls compiled'
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
