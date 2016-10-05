---
title: Content Goes Here
date: October 1, 2011
---
# Content Goes Here #

Welcome to flagrantsystemerror.com.  This is the inaugural post.

This website is intended to blog the more technical aspects of my projects.  The [hobbit-hole.org](http://www.hobbit-hole.org) never
seemed the right place for that kind of stuff.  I intended to use hobbit-hole.org to blog other pursuits, but it mostly ended up
about programming.  This website will assume that role.  I will mirror appropriate posts to [artifice-lang.org](http://www.artifice-lang.org).

I'm using git to maintain the website.  [Instructions](http://toroid.org/ams/git-website-howto) to do so are straightforward with
one caveat.  I put the website repository in ~/flagrant.git and the site directory in ~/flagrant (which is where the post-receive
hook checked the site out to).  When I pushed, the site directory wasn't updated and I received the error

```
remote: fatal: Could not jump back into original cwd: No such file or directory
```

Fortunately someone else had seen this <a href="http://stackoverflow.com/a/8513916">error</a> and posted the solution on Stack
Overflow.  Changing the checkout dir to flagrant.www resolved the error.  As for the site's design, I wouldn't say it's great, but
it suits me.  The following resources were useful:

* [Design for Developers](http://www.slideshare.net/Wolfr/design-for-developersonlineversionlong)
* [Adobe Kuler](http://kuler.adobe.com)
* [Self-Educate to Survive](http://www.netmagazine.com/opinions/self-educate-survive)
* [The Ultimate Guide to Web Typography](http://www.pearsonified.com/2011/12/golden-ratio-typography.php)

This website is static.  Nothing is used to generate the site dynamically; the site is just static html files.  For now, these files
are written by hand.  I'm looking into using a site generation tool similar to [Hyde](http://hyde.github.com/) or
[Petrify](https://github.com/caolan/petrify).  If you have any suggestions, I'd like to hear them.

Tweet your comments to <a href="http://twitter.com/icosahedron">@icosahedron.</a>
