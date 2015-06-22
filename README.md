# Flagrant System Error Blog

These are the files for a minimal blog used for my site [flagrantsystemerror](http://flagrantsystemerror.com).

The blog is a static site generated using [metalsmith](http://metalsmith.io).  All the node.js files are checked into the node_modules subdirectory.

## Usage

To generate the blog, use `node blog.js`, which will invoke metalsmith and the files into the *site* directory.

There are posts and pages.  A post is what appears on the blog, and a page is separate content
from the blog itself, but are likely referenced from individual posts (see [My C++ Coding Guidelines](http://flagrantsystemerror.com/my_cpp_coding_guidelines.html) for an example).

Posts go into the **src\posts** directory and pages go into... wait for it... the **src\pages** directory.

I use Markdown to author the posts, but the HTML is not automatically generated from it.  I use the [MultiMarkdown Composer](http://multimarkdown.com/) editor and then copy the HTML into their own files.  It generates HTML without the &lt;head&gt; and &lt;body&gt; tags.  The templates (in **src\templates**) are set up for this.

## License

The files specific to this site are licensed under the [Unlicense](http://unlicense.org/).
Otherwise, all components are licensed as they are indicated by their respective owners.
