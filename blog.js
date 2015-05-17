var Metalsmith = require('metalsmith');
var markdown = require('metalsmith-markdown');
var templates = require('metalsmith-templates');
var each = require("metalsmith-each");
var file_metadata = require("metalsmith-filemetadata");
var ignore = require('metalsmith-ignore');
var elevate = require('metalsmith-elevate');
var collections = require('metalsmith-collections');
var feed = require('metalsmith-feed');
var more = require('metalsmith-more');

var index = function(files, metalsmith, done) {
    for(var file in files) {
        var f = files[file];
        if(f.index != undefined) {
            if(files['index.html'] != undefined) {
                done(new Error("Multiple files with index property"));
            }
            files['index.html'] = f;
        }
    }
    done();
}

Metalsmith(__dirname)
    .destination('./site')
    .metadata({
        site: {
            title: "Flagrant System Error",
            url: "http://flagrantsystemerror.com",
            author: "jkint@flagrantsystemerror.com (Jay Kint)"
        },
        title: "Flagrant System Error",
        url: "http://flagrantsystemerror.com",
        author: "Jay Kint",
        description: "The system is down. I don't know what you did moron, but you sure screwed everything up good.",
    })
    // .use(each(function(file, filename) {
    //     console.log("pre: " + filename);
    //     return filename;
    // }))
    .use(ignore([
        'templates/*',
        '**/*~',  // emacs droppings
        '**/.*',  // hidden files
        '**/*.md' // markdown files
    ]))
    .use(more())
    .use(collections({
        posts: 'posts/*.html'
    }))
    .use(feed({
        collection: 'posts'
    }))
    .use(file_metadata([
        { 
            pattern : "posts/*.html", 
            metadata: { 
                template: "post.mustache",
                posts_url: "/",
                images_url: "/images/",
                sidebar_url: "/sidebar/",
                styles_url: "/styles/",
                js_url: "/js/"
            }, 
            preserve: true 
        },
        { 
            pattern : "sidebar/*.html", 
            metadata: { 
                template: "post.mustache",
                posts_url: "/",
                images_url: "/images/",
                sidebar_url: "/sidebar/",
                styles_url: "/styles/",
                js_url: "/js/"
            }, 
            preserve: true 
        },
        { 
            pattern : "pages/*.html", 
            metadata: { 
                template: "page.mustache",
                images_url: "/images/",
                styles_url: "/styles/",
            }, 
            preserve: true 
        },
    ]))
    .use(elevate({
        pattern: 'posts/*.html',
        depth: -1
    }))
    .use(templates({
        engine: 'mustache',
        directory: 'src/templates'
    }))
    .use(index)
    // .use(each(function(file, filename) {
    //     console.log("post: " + filename);
    //     return filename;
    // }))
    .build(function(err) {
        if (err) {
            console.log(err);
            throw err;
        }
    });
