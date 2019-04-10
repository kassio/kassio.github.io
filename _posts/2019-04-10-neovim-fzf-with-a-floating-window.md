---
layout: post
title: neovim fzf with a floating window
tags:
- neovim
date: 2019-04-10 23:07 +0100
---
I [already mentioned]({{ site.baseurl }}{% post_url 2019-03-21-elixir-ls-on-coc.nvim %})
the floating window feature that's coming with the next version of neovim. This
opens a whole new world of possibilities with neovim.

One nice possibility is the power of using [fzf.vim](https://github.com/junegunn/fzf.vim)
with a floating window:

![neovim-fzf-floating-window](/assets/nvim-fzf-floating-window.png)

Well, this is actually a simple solution:


```vimscript
" Reverse the layout to make the FZF list top-down
let $FZF_DEFAULT_OPTS='--layout=reverse'

" Using the custom window creation function
let g:fzf_layout = { 'window': 'call FloatingFZF()' }

" Function to create the custom floating window
function! FloatingFZF()
  " creates a scratch, unlisted, new, empty, unnamed buffer
  " to be used in the floating window
  let buf = nvim_create_buf(v:false, v:true)

  " 90% of the height
  let height = float2nr(&lines * 0.9)
  " 60% of the height
  let width = float2nr(&columns * 0.6)
  " horizontal position (centralized)
  let horizontal = float2nr((&columns - width) / 2)
  " vertical position (one line down of the top)
  let vertical = 1

  let opts = {
        \ 'relative': 'editor',
        \ 'row': vertical,
        \ 'col': horizontal,
        \ 'width': width,
        \ 'height': height
        \ }

  " open the new window, floating, and enter to it
  call nvim_open_win(buf, v:true, opts)
endfunction
```

#### Reference
- [https://github.com/junegunn/fzf.vim/issues/664](https://github.com/junegunn/fzf.vim/issues/664)

And that's it.😁
