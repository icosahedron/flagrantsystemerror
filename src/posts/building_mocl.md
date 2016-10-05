---
title: Building Mobile Common Lisp on Mac OS X
date: May 25, 2014
---
# Building Mobile Common Lisp on Mac OS X #

I recently purchased [Mobile Common Lisp](http://wukix.com") (mocl) to do some programming on iOS and Android, and will
surely use it for some OSX programming. As I wish to include some new functionality within the mocl, I needed the source code to do
so. Herein follows the story of how I built it, in more detail than the included instructions.

The `README` build instructions make certain assumptions about your familiarity with lisp build systems and tools. I'm going to fill
in some of the details for the lisp noobs (like myself) who are learning the ecosystem around lisp more so than the language itself.

## Compiler ##

These instructions are for iOS and OSX, so make sure that Xcode 5.2+ is installed, including the command line tools.

## Install SBCL ##

A lisp to build a lisp? This is pretty common actually. Mocl requires a lisp, and <a href="http://sbcl.org">SBCL</a> (Steel Bank
Common Lisp) is the recommended flavor.

Installing SBCL is straightforward using the Mac package managers. I use [MacPorts](http://macports.org), so

```
sudo port install sbcl
```

was all it took. The equivalent [homebrew](http://brew.sh) command would be

```
brew install sbcl
```

## Install Quicklisp ##

Zach Beane's [Quicklisp](http://quicklisp.org) is an essential part of any Lisp installation. It is to lisp
libraries/packages what macports/homebrew are to OSX packages. There are currently just shy of 2400 packages on Quicklisp.

Installing it is breeze easy. Just load `quicklisp.lisp` at your REPL and then `(quicklisp-quickstart:install)` to allow Quicklisp
to install itself properly. (If you have already installed Qucklisp for another lisp, you can use `(load "~/quicklisp/setup.lisp"`).
To have Quicklisp automatically load from henceforth, just run `(ql:add-to-init-file)`. It will add itself to SBCL's initialization
file in your home directory.

Additional instructions are available on the Quicklisp website if these are insufficient.

## Install Dependencies ##

From here, we shall use Quicklisp to install the needed packages to build mocl.

### MD5 ###

MD5 does pretty much what you would think it does; it implements the MD5 hash in common lisp.

You can guess how this is going to go.

```
(ql:quickload "md5")
```

### Buildapp ###

<a href="http://www.xach.com/lisp/buildapp/">Buildapp</a> is another gem from Mr. Beane. As its name implies, it packages a lisp
"application" as a standalone application.

This package is also installable via Quicklisp as `(ql:quickload "buildapp")`. However, Buildapp requires more work to properly
install. Quicklisp can simply download it and put it in a standard place. We must actually build it before using it.

To locate Buildapp, first open a terminal and cd to your quicklisp directory. By default this directory is `~/quicklisp`. From there
it should be in a location similar to `~/quicklisp/dists/quicklisp/software/buildapp-1.5.2/`. Running `make install` in this
directory will give you output similar to:

```
sbcl --noinform --no-userinit --no-sysinit --disable-debugger \
      --eval "(require 'asdf)" \
      --eval "(push \"$(pwd)/\" asdf:*central-registry*)" \
      --eval "(require 'buildapp)" \
          --eval "(buildapp::build-buildapp)" \
          --eval "#+sbcl (exit) #+ccl (quit)"
;; loading system "buildapp"
[undoing binding stack and other enclosing state... done]
[saving current Lisp image into /Users/jaykint/.quicklisp/dists/quicklisp/software/buildapp-1.5.2/buildapp:
writing 5136 bytes from the read-only space at 0x0x20000000
writing 3072 bytes from the static space at 0x0x20100000
writing 48398336 bytes from the dynamic space at 0x0x1000000000
done]
install -c -m 555 buildapp /usr/local/bin/buildapp
```

There are command line options you can use at make time to install it to a different directory if you wish. See the Buildapp website for more information on these options.

### Wu-Sugar ###

Since Wukix makes mocl, it makes sense that they would use their own utility libraries to build it.
[Wu-sugar](https://github.com/Wukix/wu-sugar) is available on github.

Unfortunately, it is not in the quicklisp directory. However, we can still use Quicklisp to load it. Quicklisp allows for
"local projects", or projects that aren't in its repository. If the package is in the `~/quicklisp/local-projects` directory or
available in the ASDF registry, then Quicklisp will load it as if it were in its package list.

We are going to install it to the local projects directory via

```
git clone https://github.com/Wukix/wu-sugar.git
```

Now that it is in available, we can use Quicklisp to load it as any other package.

```
(ql:quickload "wu-sugar")
```

Now we have installed all the lisp dependencies.

## Configuration ##

We now need to configure a couple of paths for mocl to be able to build.

### Mocl Config ###

To build, mocl needs the .moclconfig.lisp file in your home directory. The easiest route to creating this is to run the mocl itself.
So yes, you will need to download the mocl binaries.

Once downloaded and installed, run mocl and answer the prompts; your session should look something like this:

```
~/dev/mocl-bin/bin/ ./mocl
Could not find .moclconfig.lisp in your home directory. Create now? (y or n) y
mocl root directory location? [/Users/jaykint/mocl/] /Users/jaykint/dev/mocl
ASDF registry location? mocl will search here for .ASD links [/Users/jaykint/dev/mocl/systems/] /Users/jaykint/dev/mocl/systems/
```

This produced a .moclconfig.lisp file:

```
;;; This config file is structured as a property list
;;;
;;; Options:
;;;
;;; :mocl-root-directory
;;; Path to mocl's own files.
;;; e.g. "/Users/jdoe/mocl"
;;;
;;; :asdf-registry
;;; Path to a single ASDF "link farm". Mocl's own ASDF searches here, and
;;; here alone to find CL libraries.
;;; More specifically, this should be a path to a single directory containing
;;; symbolic links (on Windows: shortcuts) to ASD files. (require :foo) would
;;; search here for foo.asd, and load it.
;;; e.g. "/Users/jdoe/mocl/systems"

(:MOCL-ROOT-DIRECTORY "/Users/jaykint/dev/mocl/" :ASDF-REGISTRY
 "/Users/jaykint/dev/mocl/systems/")
```

You should be able to use this file if the mocl binaries are not available to you, changing the paths to match your set up.

### Mocl ASDF ###

Now we must make mocl and its dependencies available to [ASDF](http://common-lisp.net/project/asdf/) so SBCL may load them when
building mocl.

First, we need to locate the .asd files that ASDF uses. With ASDF 3, the version currently shipping with SBCL, we will use a config
file to let ASDF know where to find the mocl.asd file (as described in
[Section 4.1](http://common-lisp.net/project/asdf/asdf.html#Configuring-ASDF-to-find-your-systems) of the ASDF documentation).

The config file will be in the `~/.config/common-lisp/source-registry-config.` directory. It can consist of various directives, but
we are only going to use `:directory`. Given the default values for Quicklisp, the file should look similar to this:

```
(:directory "/Users/jaykint/dev/mocl/src")
(:directory "/Users/jaykint/.quicklisp/local-projects/wu-sugar")
(:directory "/Users/jaykint/.quicklisp/dists/quicklisp/software/md5-20130312-git")
```

Unfortunately this DSL can not have lisp code within it. I had originally tried to use `(expand-file-name "~/...")` with the paths,
but it was not executed and caused errors.

## Build ##

With everything in place, we can now build mocl itself. Well almost. First, we must build the runtime.

Mocl builds with a single makefile. As the README states, "Most of the make targets depend on the runtime, so you should build
the runtime first.", so we shall. From the mocl root directory

```
make runtime
```

This will present lots of messages about compiling and saving files. If anything goes wrong, recheck your configuration for the
dependencies. Or you can e-mail me if you desire and I can perhaps help. Of course, there is always Wukix, who have been helpful in
answering questions and resolving concerns of mine.

After the runtime is made,

```
make mocl
```

will produce a much more modest output:

```
touch src/compiler/clcdef.lisp
mkdir -p bin
buildapp --load-system mocl --entry mocl::main --output ./bin/mocl
;; loading system "mocl"
[undoing binding stack and other enclosing state... done]
[saving current Lisp image into ./bin/mocl:
writing 5136 bytes from the read-only space at 0x0x20000000
writing 3072 bytes from the static space at 0x0x20100000
writing 127008768 bytes from the dynamic space at 0x0x1000000000
done]
```

To place mocl where it can be easily run, `make install` will install it. The default location is `/usr/local/bin`, but I prefer to
keep software the /opt directories, so I modified the Makefile:

```
DESTDIR=/opt/local
```

Last, to have your app run with mocl, you'll need to build the libraries:

```
make ioslib
...
make osxlib
...
```

These will produce static libraries in the lib directory of your mocl source. Along with the .h files there, this should be enough
to start using mocl.

Which is where we'll start next time.
