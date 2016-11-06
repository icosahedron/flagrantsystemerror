var Metalsmith = require('metalsmith');
var layout = require('metalsmith-layouts');
var each = require("metalsmith-each");
var file_metadata = require("metalsmith-filemetadata");
var ignore = require('metalsmith-ignore');
var elevate = require('metalsmith-elevate');
var collections = require('metalsmith-collections');
var feed = require('metalsmith-feed');
var permalinks = require('metalsmith-permalinks');
var which = require('which');

var child_process = require('child_process');
var path = require('path');

// set the index.html file from the single file that has index:true in its metadata
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

// convert multimarkdown files to html
// for now only works with the posts
var mmd = function(options = {}) {

    // verify that mmd is installed
    // (this will throw an error if it's not installed)
    var mmdVersion = child_process.execSync('mmd -v');

    var collectionName = options.collection;
    if(collectionName === 'undefined') {
        throw new Error('collection option is required. See metalsmith-collections.');
    }

    return function(files, metalsmith, done) {
        var metadata = metalsmith.metadata();
        if(metadata.collections === 'undefined') {
            throw new Error('collections is not configured.  See metalsmith-collections.');
        }
        var collection = metadata.collections[collectionName];
        // for(var file in files) {
        //     console.log(file);
        // }
        // console.log("---------");
        // for(var file in collection) {
        //     if(typeof collection[file] === 'undefined') {
        //         continue;
        //     }
        //     console.log(collection[file].source);
        // }
        for(var file in collection) {
            // console.log("file: " + file);
            // console.log(collection[file]);
            var cmd = "multimarkdown -s --to=html";
            // console.log(collection[file].contents.toString('utf8'));
            if(typeof collection[file] === 'undefined') {
                continue;
            }
            var html = child_process.execSync(cmd, { input: collection[file].contents });
            collection[file].html = html;
            var newFile = collection[file].source;
            newFile = path.dirname(newFile) + path.sep + path.basename(newFile, '.md') + ".html";
            // console.log("old file: " + collection[file].source + " new file: " + newFile);
            files[newFile] = files[collection[file].source];
            // console.log(files[collection[file].source] + " " + files[newFile]);
            if(files[collection[file].source])
            files[newFile].contents = html;
            delete files[collection[file].source];
        }
        done();
    }
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
        credits: "Title graphic from <a href=\"http://www.homestarrunner.com/sbemail50.html\">Homestar Runner SB E-mail 50</a>.<br> \
        Site design inspired by <a href=\"http://blog.alexandrevicenzi.com/\">Alexandre Vicenzi</a>. <a href=\"http://flagrantsystemerror.com/rss.xml\">RSS feed</a>."
    })
    .use(ignore([
        'templates/*',
        '**/*~',  // emacs droppings
        '**/.*',  // hidden files
        '**/*.html', // all the HTML files are ignored
    ]))
    .use(each(function(file, filename) {
        file.source = filename;
        return filename;
    }))
    // .use(permalinks({
    //     pattern: ':title'
    // }))
    .use(collections({
        mdfiles:
            { pattern: '**/*.md',
              sortBy: 'source',
              refer: false }
    }))
    // requires the source parameter created above
    .use(mmd({
        collection: 'mdfiles'
    }))
    // .use(feed({
    //     collection: 'posts'
    // }))
    .use(file_metadata([
        {
            pattern : "posts/*.html",
            metadata: {
                layout: "post.mustache",
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
                layout: "post.mustache",
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
                layout: "page.mustache",
                images_url: "/images/",
                styles_url: "/styles/",
            },
            preserve: true
        },
    ]))
    .use(layout({
        engine: 'mustache',
        directory: 'src/templates',
    }))
    .use(elevate({
        pattern: 'posts/*.html',
        depth: -1
    }))
    .use(index)
    // .use(each(function(file, filename) {
    //     console.log("post: " + filename);
    //     return filename;
    // }))
    // .clean(false)
    .build(function(err) {
        if (err) {
            console.log(err);
            throw err;
        }
    });
