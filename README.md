# Flagrant System Error Blog

These are the files for a minimal blog used for my site [flagrantsystemerror](http://flagrantsystemerror.com).

The blog is a static site generated using [metalsmith](http://metalsmith.io).

## Install

[MultiMarkdown](http://fletcherpenney.net/multimarkdown/) and node.js/npm must already be installed.  Run the following to download
the necessary dependencies required for the blog.

```
brew install MultiMarkdown
npm install
```

## Usage

To generate the blog, use `node blog.js` in the root directory, which will invoke metalsmith and generate the files in the **site**
directory.

There are posts and pages.  Posts are what appear on the blog, and pages are separate content
from the blog itself, but are likely referenced from individual posts (see
[My C++ Coding Guidelines](http://flagrantsystemerror.com/my_cpp_coding_guidelines.html) for an example).

Posts go into the **src/posts** directory and pages go into... wait for it... the **src/pages** directory.

I use Markdown to author the posts and generate the html with MultiMarkdown.  I use
[MultiMarkdown Composer](http://multimarkdown.com/) to author the posts, and MultiMarkdown generates the same HTML as MultiMarkdown
Composer does (since they were both written by the same person).

The HTML generated does not contain the full document, but just the snippet of the document, which is then inserted into a Mustache
template (kept in **src/templates**).

## License

The files specific to this site are licensed under the [Unlicense](http://unlicense.org/).
Otherwise, all components are licensed as indicated by their respective owners.
