# iPad Web Authoring Workflow

(Editorial note: This page is now out of date.  I need to update the workflow, but you can see the [colophon](/navbar/colophon.html) for the tools used to produce this website.)

I’ve long wanted to be able to author my blog on my iPad. There are a few apps for doing so if you use one of the standard blogging engines, but this site is static html, so those apps don’t work.

Until now I have written posts on the iPad, but then I had to e-mail them to myself and use an html editor on my Mac to manage the files. Hardly a problem, but not exactly what I wanted. Now, with this workflow I can author posts completely on the iPad. However, I haven’t excluded my Mac; it too can still be used to write for this blog.

This post isn’t so much a review as an overview. First I discuss the tools I use and then briefly discuss the process I use to put a new post up.

## Tools

Now, with the release of Diet Coda, it is easy to author new posts while on the iPad itself. Diet Coda was the missing link in the toolchain.

The tools I use probably have equivalents just as good in the App Store. These just happen to be the ones I use (and I will explain why I chose them).

### Editorial

While Diet Coda has a built in html editor, I can’t say I’m overly fond of writing straight html. I like to use Markdown, and Editorial is my Markdown editor of choice. It’s a little pricy compared to other Markdown editors, but the best Markdown editor I know of.  Plus it handles TaskPaper files.

### Git and Workflow

I use git to manage the history and changes to this website. I wouldn’t want to build a website without version control, and git is arguably the best version control available today.  Workflow on the iPad is a very nice Git client and can share files with Editorial and other apps.

### Diet Coda

This is the last link in the pipeline. Released recently (May 24th, 2012), it has proven most capable. Panic advertises it for quick fixes, and I think that is accurate.

The HTML editor is capable, but it is slow because of the Intellisense (or whatever they call it) that it does for every tag. Diet Coda also includes a file manager and a very good SSH prompt (based on their Prompt iPad SSH app) which I use extensively in this workflow.

### Blink ###

Blink is a mosh client that handles any server side interactions.  Despite Diet Coda's SSH prompt, mobile communications needs a more robust solution, and Blink/mosh provides that.  With roaming, you can shut off your iPad and come back later on a different network and pick up right where you left off.  (Adding tux to the mix makes it almost perfect.)

## Workflow

To post a new article to the blog is a simple, manual process using the tools above. I bet you can easily see how this works. It’s hardly magic.

### Git Repo Setup

This website is managed between 3 git repos. There is what I call the live repo. This repo is for the live site and its use is detailed in Content Goes Here.

Since Diet Coda doesn’t store websites locally, I have another git repo on a server that contains the files to change. Diet Coda updates these files in its editor. I then use the built in ssh terminal to log into the server and commit these changes to this Diet Coda repo. I am then able to push the changes to the live repo which updates to the live site.

On the Mac, I have a local repo that has remotes to the live repo and to the Diet Coda repo. I can easily pull and push changes between the Mac and these other two repos.

### Prepare the New Post

As I’ve mentioned in a few places now, this site is purely static HTML with comments managed by Disqus. Among those static files are blank template HTML and CSS files for new posts.

When I want to write a new post, I use the file manager in Diet Coda to copy the blank post file to a new file (e.g., this file is called ipad-www-workflow.html). I then edit the new file to set the disqus_identifier since otherwise I will likely forget. :)

### Write the Post

Off then to Editorial. The post is written (and synced to Dropbox for safe-keeping). Once edited, the Markdown is converted to HTML using MultiMarkdown. (Despite the brevity of this section, this is the longest part of the process.)

### Post It

Now for the pièce de résistance.

To make the post public, time to fire up Diet Coda and edit/paste the new post created earlier. In the new post is a comment that shows where to paste the converted Markdown HTML. I then preview the post to make sure that it looks as expected. If all goes well, that’s it. If not, Diet Coda’s HTML editor is perfect for the minor tweaks.

Next I integrate the new post into the site. Diet Coda can do this as well. I open archive.html and add the new entry into the list. Last, I copy the new post over the existing index.html to make it the default post.

Now time to make the post live. Diet Code has an ssh prompt built in, so I log into the server containing the Diet Coda git repo, commit the changes, and then push them to the live git repo. Easy peasy.

## Future

This is a heavily manual process. I see an opportunity to make an app to automate and otherwise manage a process like this. However, anything automated would probably require a backend to manage as well, and I’m not sure I want to have to tackle that too.

Otherwise I will continue to monitor the App Store and app reviews to see if something better comes along.

Hopefully this was useful to you.
