# Goodbye Emacs, Hello Sublime Text 2

This all starts with a search for a good full screen editing experience.

## Emacs for Life

I've been a die hard Emacs fan for years.  I first used Emacs at a job using Linux to develop Java applications in the mid 1990's. I really became enamored with it when I started using SLIME to run various Lisps. I've written several emacs extensions for personal use (and even released a few, though they've garnered very little use). I've been among those who say that Emacs is an OS, not a text editor. I've used it for e-mail, news, irc, and almost anything text based. (I never been one to surf the web in Emacs though.)

In other words, I was/am heavily invested in Emacs.

### What's wrong with Emacs?

Then came OSX Lion and full screen apps. For full screen though, Emacs has yet to get it right.  Actually, they *just* enabled the feature in 24.2, but it just doesn't quite work. Aquamacs, the specialized version of Emacs for OSX, has had full screen for a while, but it has the same issues that vanilla OSX Emacs has.

I know, it's a nitpick. It's easy enough to just enlarge an Emacs screen to fit one of the desktop screens, and that works fine. Maybe I was just ready for a switch and that's the convenient excuse I used to justify it.

## Enter Sublime Text 2

After a brush/ with Vim[^Vim], I thought Sublime Text 2 (ST2) would be worth a try. 

I'm not sure where I first heard or saw ST2. A few months ago I kept seeing press on it. It seemed to be popular on [Hacker News](http://news.ycombinator.com/item?id=3717754), and I kept reading of people who switched to ST2 [from Textmate](http://www.reddit.com/r/web_design/comments/10vfw0/just_switched_over_to_sublime_text_2_from/) or [from Emacs](http://brizzled.clapper.org/blog/2012/02/06/a-sublime-text-2-plugin-to-set-the-syntax-from-the-file-name/). 

## What makes ST2 so great?

ST2 is a beautiful editor. Plain, simple, and to the point. It handles text very well, and it has the little bells and whistles that make it a joy.

There are several reasons I use it:

- Proper Full Screen - Works great and looks great. Easy to move between files and has great side by side display of files.
- Extensible - Couldn't use it without being extensible.  Keyboard bindings, text display, and a good Python API.  I hope they add more to it though, as there are hooks I would like.
- Extensions - not as many as Emacs, but it has everything I want, including decent [gdb integration](https://github.com/quarnster/SublimeGDB).
- Multiple Cursors - I thought this was sort of a cool gee-whiz, but it really is helpful.
- Fast - Emacs can hang for a while some times; has yet to happen with ST2.
- Sidebar - Never could get a good sidebar working with Emacs. ST2 works well.
- Find Anything - Out of the box and plugins allow for easy lookup.
- Package Manager - Not built in, but [Package Control](https://github.com/wbond/sublime_package_control) is brilliant, at least as good as Emacs' package manager
- Project - along with the sidebar, the project concept is good for grouping files together.
- Consistent Cross Platform - The look and feel of ST2 across platforms is about as uniform as any software I've ever used.

## Sublime Text Isn't Utopia or even Hazzard 

That said, there are some really good things about Emacs that I'm already missing.

- Documentation - Not only can you do anything with Emacs, finding out how is just a search engine away. ST2 has good docs, but not nearly as thorough as Emacs does. (It's hard to beat 30+ years of legacy.)
- Block Cursor - the built-in tiny caret is not as visible as a good ol' fashioned block.
- file|folder_exclude_pattern - why only exclude and not include options in projects?
- modes vs. syntax - modes are much more versatile.
- [magit](https://github.com/magit/magit) - the best interface to git[^Git].
- minibuffer w/ ido-mode - much better way to open files than using the standard Open File dialog.
- taskpaper mode - Sublime Text 2 has a decent way to edit these files, but the Emacs mode is superior.

## Is It Either Or?

Of course not. A text editor is not a monogamous commitment. I've just made the decision that Emacs is not my first choice when editing text files.

I imagine that I will use Emacs for many future tasks. However, for software development and general text editing, ST2 has been my choice for the last several months and will be the editor of choice in the future.

[^Vim]: Either your love it or you hate it.

[^Git]: I've been using [SourceTree](http://www.sourcetreeapp.com/) to manage git repositories since switching to ST2.
