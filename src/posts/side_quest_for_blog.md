# Side Quest for the Blog #

So I know not a lot of people read this blog.  That's fine.  It's not done for vanity, but for writing practice and the occasional person who might find something interesting.  I guess it could be considered  a portfolio of sorts, though there isn't much yet to show for it.

But... I do want at least the search engines to properly index it.

## Searching for the Grail ##

The former incarnation of this blog was a shell that would dynamically load articles via jQuery ajax.  It worked great, and the response was pretty smooth I think.  However, when searching for an article, the search engines didn't link to the URL that would load the shell and then the article, they linked to the article text directly.

This loaded just the article text, which looked like a circa 1995 website.

How to fix this?  Well, the site has to load the shell and the article from any URL.  I experimented with redirection with the meta tag, but it didn't give me the results I wanted.

## Visit the Smithy ##

The easiest remedy was to just create truly static pages.  While I could have done this by hand in a single afternoon, I, being a programmer, and therefore [lazy](http://threevirtues.com/), couldn't just do the straightforward.

After a bit of research into static site generators, I finally settled on [Metalsmith](http://metalsmith.io).  It's Javascript (important to my work on my outliner) and extremely simple and flexible.

This is not a [tutorial](http://www.robinthrift.com/posts/metalsmith-part-1-setting-up-the-forge/) on using Metalsmith.  Instead, I will explain how I use it to build this blog.

### Javascript vs. Configuration ###

First, Metalsmith can be used in two modes:
- a JSON configuration file
- as an API in a script

I opted for the API as a script because I had to create a simple plugin to create an index page, and JSON configuration obviously can't contain functions.  Here is an explanation of `blog.js`, the driver for creating the blog from the static assets I have.

### Load the Plugins ###

The first task is to load the plugins required to build the site:

```
var Metalsmith = require('metalsmith');
var templates = require('metalsmith-templates');
var file_metadata = require('metalsmith-filemetadata');
var ignore = require('metalsmith-ignore');
var elevate = require('metalsmith-elevate');
var collections = require('metalsmith-collections');
var feed = require('metalsmith-feed');
var more = require('metalsmith-more');
```

Pretty straightforward.  Each one is explained as it is used.

### Index Plugin ###

Here is the plugin that creates the index page based on the `index` tag that is in the metadata.

```
var index = function(files, metalsmith, done) {
    for(var file in files) {
        var f = files[file];
        if(f.index != undefined && f.index ) {
            if(files['index.html'] != undefined) {
                done(new Error("Multiple files with index property"));
            }
            files['index.html'] = f;
        }
    }
    done();
}
```

This plugin is just a function that scans the files for the index metadata property and copies the file that has it to index.html for the site.  If more than one file has the index property, then an error is thrown since there can be only one.

### Site and Metadata ###

Metalsmith invokes the plugins as a chain of promises, starting with itself.

The first in our chain is the destination directory, which I'm calling 'site'.  Next comes some metadata that applies to the entire site.

```
Metalsmith(__dirname)
    .destination('./site')
    .metadata({
        site: {
            title: "Flagrant System Error",
            url: "http://flagrantsystemerror.com",
            author: "jkint@flagrantsystemerror.com (Jay Kint)"
        }
    })
```

Next is a simple ignore plugin, which predictably enough gives some patterns for files to ignore while processing.  Here, I'm telling it to ignore the templates and the remnants of my editor.

```
    .use(ignore([
        'templates/*',
        '**/*~',  // emacs droppings
        '**/.*',  // hidden files
    ]))
```

The next 3 plugins, `more`, `collections`, and `feed`, work in tandem to produce the RSS feed.  More extracts the description and title from the post into metadata (the less key specifically) and collection and feed use the metadata to publish into the rss.xml file.

```
    .use(more())
    .use(collections({
        posts: 'posts/*.html'
    }))
    .use(feed({
        collection: 'posts'
    }))
```

The file_metadata plugin provides canned metadata for various files based on their path.  See the template description below for a better explanation of what the metadata is used for.

```
    .use(file_metadata([
        { 
            pattern : "posts/*.html", 
            metadata: { 
                template: "main.mustache",
                posts_url: "",
                images_url: "images/",
                sidebar_url: "sidebar/",
                styles_url: "styles/",
            }, 
            preserve: true 
        },
        { 
            pattern : "sidebar/*.html", 
            metadata: { 
                template: "main.mustache",
                posts_url: "../",
                images_url: "../images/",
                sidebar_url: "",
                styles_url: "../styles/",
            },
            preserve: true 
        }, 
    ]))
```

Elevate will move files in the destination directory relative to their location in the source directory.  As you can see, any files in the pages and posts directories are moved up a directory with in the path.  This puts them at the root of the site.

```
    .use(elevate({
        pattern: 'posts/*.html',
        depth: -1
    }))
    .use(elevate({
        pattern: 'pages/*.html',
        depth: -1
    }))
 ```

And here's where the magic happens.  The template plugin is capable of using one of several template engines.  I use mustache.  The template itself is explained below.

```
    .use(templates({
        engine: 'mustache',
        directory: 'src/templates'
    }))
```

To finish off our trip through the script, here we use the index plugin we created above, and then the actual build action which performs everything in our pipeline.

```
    .use(index)
    .build(function(err) {
        if (err) {
            console.log(err);
            throw err;
        }
    });
```

*(The error callback is necessary for the build function to work.)*

### Lay of the Land ##

So what is the directory layout for the site?  Some of it is probably evident from the script above.

Metalsmith starts with the `src` directory by default for sources, and `build` as the default destination directory.  I chose to modify the destination to be `site`.

|Directory|Description|  
| :------	|:------	|  
|src/posts|Meat of the blog|
|src/pages|Individual pages that are not chronologically organized|  
|src/templates|The templates for the blog posts and pages|  
|src/sidebar|Pages linked to by the sidebar|  
|src/images|Pictures and images for the site|  
|src/styles|CSS files|  
|site|Posts and pages are in the root of the site|  
|site/sidebar|Pages linked to by the sidebar|  
|site/images|Pictures and images for the site|  
|site/styles|CSS files|  

The `site` directory can be deployed directly to the web server (Amazon S3 in this site's case).

## The Knights Template ##

I won't bore you with the entire template as we did with the script above.  Instead, here is the content and sidebar portion.

```
<div id="content">
    <div class="grid">
        <div class="grid-col-1-5">
          <div id="sidebar">
            <p>By JAY KINT</p>
            <br/>
            <p><a href="{{{ posts_url }}}index.html">HOME</a></p>
            <p><a href="{{{ sidebar_url }}}archive.html">ARCHIVE</a></p>
            <p><a href="{{{ sidebar_url }}}colophon.html">COLOPHON</a></p>
            <p><a href="{{{ sidebar_url }}}projects.html">PROJECTS</a></p>
            <p><a href="{{{ sidebar_url }}}contact.html">CONTACT</a></p>
          </div>
        </div>
        <div class="grid-col-4-5">
          <div id="post">
            {{{ contents }}}
            </div>
        </div>
    </div>
</div>
```

You can see how the url metadata from the script is used within the template.  Since posts exist in the site's root directory, the sidebar_url is set to "sidebar/".  For the pages within the sidebar directory, the sidebar_url is set to "".  Likewise posts_url is set to "" for posts in the root and "../" for the pages within the sidebar.

Images and styles are likewise handled relative to the sidebar/post.

## The Reward ##

I really like Metalsmith and its flexibility.  It was easy to come up with this solution to my SEO problems in an afternoon.  I would recommend Metalsmith if you're looking for very extensible and otherwise minimal site generator.
