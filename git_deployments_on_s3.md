# Website Deployments to S3 through Git and EC2

### To Do for Site

As I wrote at the [beginning of this blog](#content_goes_here), this is a static site that is deployed via Git.  However, I have since decided to move everything to S3 for a variety of reasons:

* Price - Amazon S3 is pay for what you use, and this blog is not likely to see huge influxes of traffic so the cost should remain very reasonable.
* Reliability and Performance - With Amazon CloudFront the pages are distributed across the world for redundancy and performance.

I didn't want to sacrifice the ease of deployment I had previously, so like any <del>good</del>lazy engineer, I spent too much time figuring out how to automate the process to be similar to the previous process (hopefully that sentence isn't too hard to process).

This post will describe the scripts that I use to host this blog on S3 and deploy it from a git repository. *Note: If you intend to follow the commands in this article, please read the entire thing, since there is a choice about where these commands are issued.*

## Setup Your Site on Amazon S3

Follow directions as outlined by Amazon on AWS Developer site.  Verify that it works.

## Git Repositories for your Site

We need a remote git site from which to deploy our website.  While possible to deploy to S3 from local git repositories, I advocate the use of a remote repository for a couple of reasons:

* Backups - the remote repository serves as a great place for the last good copy of your website
* Multiple workspaces - because I have a central repository, I can work in two different repositories, one via my [iPad](#ipad-www-workflow) and another on my Mac.

(The following instructions could likely be easily adapted to maintain a website to S3 via a local repository.)

### Create the Site's Repositories (Local and Remote)

There are many [tutorials](http://www.git-scm.com/book/en/Git-Basics) on how to create a git repository and add files to it.  Also create your [remote](http://www.git-scm.com/book/en/Distributed-Git-Distributed-Workflows) repository.

### Install Amazon S3 Tools (Remote)

To allow git to deploy to S3, we need command line tools that will copy files to S3.  My choice is the [aws-cli](http://github.com/aws/aws-cli) suite.  They are set of python scripts that implement an easy interface to almost all the Amazon Web Services.

Installation instructions are found at the [github repo](http://github.com/aws/aws-cli).  I was able to use the dead simple pip:

```
pip install awscli
```

### Set to Deploy! (Remote)

There are two options for getting git to copy your site's files to S3.  But before we decide which one to employ, first test to make sure that our site can be copied appropriately.

By appropriate, I mean there is one caveat; files copied to S3 should have a content type associated with them.  Websites have different files and therefore different content types.  The simplest option is to issue one S3 command for each file type:

```
find . -type f -name '*.html' | sed -e "s/\.\///g" | xargs -I xxxyyyzzz aws s3 put-object --bucket "flagrantsystemerror.com" --key "xxxyyyzzz" --body "xxxyyyzzz" --content-type "text/html"
```

The explanation is hopefully straightforward.  This command will find all the .html files, uses sed to strip the leading './' from the path returned by find, followed by copying the object to S3 (in this case, the bucket for this website, flagrantsystemerror.com) using aws-cli.  (The xxxyyyzzz is the symbol for substitution of the filename.)  You will want to run this command for each file type in your website.

### Hook, Line and Sinker (Remote)

So we have a way to store our website and a way to deploy it.  How do we marry the two?  Can we deploy the website when we update the repository?  The answer is in in git hooks.

What is a git hook?  Once again, [great explanations](http://toroid.org/ams/git-website-howto) are readily available.

Here we use the post-receive hook to update the website after a push has been received.

```
#!/bin/sh
export AWS_CONFIG_FILE=~/.awscli
# the following two lines are for remote repositories
GIT_WORK_TREE=~/www/flagrant.www git checkout -f
cd ~/www/flagrant.www
find . -type f -name '*.html' | sed -e "s/\.\///g" | xargs -I xxxyyyzzz aws s3 put-object --bucket "flagrantsystemerror.com" --key "xxxyyyzzz" --body "xxxyyyzzz" --content-type "text/html"
find . -type f -name '*.jpg' | sed -e "s/\.\///g" | xargs -I xxxyyyzzz aws s3 put-object --bucket "flagrantsystemerror.com" --key "xxxyyyzzz" --body "xxxyyyzzz" --content-type "image/jpeg"
find . -type f -name '*.gif' | sed -e "s/\.\///g" | xargs -I xxxyyyzzz aws s3 put-object --bucket "flagrantsystemerror.com" --key "xxxyyyzzz" --body "xxxyyyzzz" --content-type "image/gif"
find . -type f -name "*.png" | sed -e "s/\.\///g" | xargs -I xxxyyyzzz aws s3 put-object --bucket "flagrantsystemerror.com" --key "xxxyyyzzz" --body "xxxyyyzzz" --content-type "image/png"
find . -type f -name '*.css' | sed -e "s/\.\///g" | xargs -I xxxyyyzzz aws s3 put-object --bucket "flagrantsystemerror.com" --key "xxxyyyzzz" --body "xxxyyyzzz" --content-type "text/css"
find . -type f -name '*.xml' | sed -e "s/\.\///g" | xargs -I xxxyyyzzz aws s3 put-object --bucket "flagrantsystemerror.com" --key "xxxyyyzzz" --body "xxxyyyzzz" --content-type "text/xml"
find . -type f -name '*.ico' | sed -e "s/\.\///g" | xargs -I xxxyyyzzz aws s3 put-object --bucket "flagrantsystemerror.com" --key "xxxyyyzzz" --body "xxxyyyzzz" --content-type "text/x-icon"
```

The script above checks the site out to a directory on the server and then copies the files using the previously installed awscli tools.  You may want to verify that all the necessary files types that your site needs are represented.

## (Optional) Using EC2 to Deploy (Local)

If you have a server up and running all the time, then this step is not necessary.  You can simply host your remote repository that deploys to S3 from you server server.  (This website used to do exactly that on a VPS server I had an account for.)

I don't have a server that is running all the time.  This step is about starting EC2 instance to perform the deployment and stopping it when finished.  Since the server only serves as a backup.

### Install AWS CLI Tools

We've installed the tools on the remote machine, but since we'll be manipulating an EC2 instance, we need to install aws-cli again on our local box.  See the above instructions.

### Starting and Stopping EC2 Instance

Before embarking on our automation, let's verify that we can start the instance, push an update to our repository, and stop the instance manually.

### pre-push



### Deploying via EC2


## URLs for future reference

* http://www.nullstyle.com/2007/06/22/create-custom-commands-in-git/
* http://fusiongrokker.com/post/creating-custom-git-commands
* http://superuser.com/questions/227509/git-ping-check-if-remote-repository-exists
* https://github.com/git/git/blob/87c86dd14abe8db7d00b0df5661ef8cf147a72a3/templates/hooks--pre-push.sample
* https://github.com/aws/aws-cli
