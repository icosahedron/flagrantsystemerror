---
title: Website Deployments to S3 through Git and EC2
date: July 12, 2013
---
# Website Deployments to S3 through Git and EC2 #

As I wrote [when I started this blog](/content_goes_here.html), this is a static site that is deployed via Git.  
However, I have since decided to move everything to Amazon S3 for a couple of reasons:

* Price - Amazon S3 is pay for what you use, and this blog is not likely to see huge influxes of traffic so the cost should remain
very reasonable.
* Reliability and Performance - With Amazon CloudFront the pages are distributed across the world for redundancy and performance.

I didn't want to sacrifice the ease of deployment I had previously, so like any <del>good</del>lazy engineer, I spent too much time
figuring out how to automate the process to be similar to the previous process (hopefully that sentence isn't too hard to process :)).

This post will describe the steps and scripts that I use to host this blog on S3 and deploy it from a git repository via a dynamic
EC2 instance.

## Setup Your Site on Amazon S3 ##

Follow directions as outlined by Amazon on [AWS Developer site](http://aws.typepad.com/aws/2012/12/root-domain-website-hosting-for-amazon-s3.html).
Verify that it works.

## Setup Git Repository for Your Site ##

We need a remote git site from which to deploy our website.  While possible to deploy to S3 from local git repositories, I advocate
the use of a remote repository for a couple of reasons:

* Backups - the remote repository serves as a great place for the last good copy of your website. Git can't save you from a bad disk.
* Multiple workspaces - because I have a central repository, I can work from multiple places.  I typically work my sites via my
[iPad](/ipad-www-workflow.html) and on my Mac.

### Create the Site's Repositories (Local and Remote) ###

There are many [tutorials](http://www.git-scm.com/book/en/Git-Basics) on how to create a git repository and add files to
it.  Also create your [remote](http://www.git-scm.com/book/en/Distributed-Git-Distributed-Workflows)< repository.

### Install Amazon S3 Tools (Remote) ###

To allow git to deploy to S3, we need command line tools that will copy files to S3.  My choice is the
[aws-cli](http://github.com/aws/aws-cli) suite.  They are set of python scripts that implement a command line interface to almost
all the Amazon Web Services.

Installation instructions are found at the [github repo](http://github.com/aws/aws-cli).  I was able to use the dead simple pip:

```
pip install awscli
```

and I set my AWS credentials in the file ~/.awscli using my .bashrc/.zshenv:

```
export AWS_CONFIG_FILE=~/.awscli
```

### Set to Deploy! (Remote) ###

Before automating the copy from the git repository to S3, we should test to make sure it can be done.

There is one caveat; files copied to S3 should have a content type associated with them.  Websites have different files and
therefore different content types.  The simplest option is to issue one S3 command for each file type:

```
find . -type f -name '*.html' | sed -e "s/\.\///g" | xargs -I xxxyyyzzz aws s3 put-object --bucket "flagrantsystemerror.com" --key "xxxyyyzzz" --body "xxxyyyzzz" --content-type "text/html"
```

This command line is hopefully straightforward.  It will find all the .html files, uses sed to strip the leading './' from the path
returned by find, followed by copying the file to S3 (in this case, the bucket for this website, flagrantsystemerror.com) using
aws-cli.  (The xxxyyyzzz is the symbol for substitution of the filename.)  You will want to run this command for each file type in
your website.

### Hook, Line and Sinker (Remote) ###

So we have a way to store our website and a way to deploy it.  How do we unite the two?  Can we deploy the website when we update
the repository?  The answer is to use a git hook.

What is a git hook?  Once again, [great explanations](http://toroid.org/ams/git-website-howto") are readily available.

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

The script above checks the site out to a directory on the server and then copies the files using the previously installed aws-cli
tools.  **Note: It is hopefully obvious, but maybe not; the above hook will *not* copy all the files in the repository, only those
types listed (e.g., README.TXT would not be copied to S3).** You will want to verify that all the necessary files types that your
site needs are represented.

## Using EC2 to Deploy (Optional, Local) ##

If you have a server up and running all the time, then this step is not necessary.  You can simply host your remote repository that
deploys to S3 on your server and push when you're ready to deploy.

I don't have a server that is running all the time.  Instead, I use an EC2 instance that dynamically starts and stops with each push.

The biggest challenge for deploying via an EC2 instance is that the host name and ip address changes with every (re) start.  If
you've seen the host names for an EC2 instance, they are in the format ec2-nn-nn-nn-nn@region.compute.amazonaws.com where nn is the
ip address for the instance.  The trick is to use this name in the update process.

The steps below configure your local repository to be able to start the EC2 instance, push the local repo to it (despite its
changing host name), and then stop it.  Using a micro instance, this will cost US$0.02 per push.  *Evaluate if your update schedule
will indeed save you money.*  Also, I find that the start and stop procedures add about a minute or two each push.

<h3>Create Amazon EC2 Instance</h3>

Follow the [directions](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html) as outlined by Amazon on AWS
Developer site.  Verify that you can connect to it.  These instructions assume you have set up SSH public key authentication for
your instance.

You will need the instance-id of your EC2 instance for the following steps.

### Install Tools (Local) ###

#### AWS CLI Tools ####

We've installed the tools on the remote machine, but since we'll be manipulating an EC2 instance, we need to install aws-cli again
on our local box.  See the above instructions.

#### jq JSON Parser ####

[jq](http://stedolan.github.io/jq/) is a simple command line json query tool.  Give it a JSON path and it will return the JSON
value.  This will be used to parse the name and status of EC2 instances as we deploy our web site.

#### Storm ####

If you use ssh and are using public key authentication, which you really should, then you will need the
[Storm](https://github.com/emre/storm) ssh config manager.  Since git push (or any git command) cannot specify an identity file,
Storm is used to dynamically create (then delete) an ssh config profile.

#### git-sync-ec2 scripts ####

Download the [git-sync-ec2](/download/git-sync-ec2-scripts.zip) scripts from this site and put them somewhere in your path.  They
are also available on [BitBucket](https://bitbucket.org/icosahedron/git-sync-ec2).

### Manual Verification (Local, Optional) ###

Before embarking on our automation, let's verify that we can start the instance, push an update to our repository, and stop the
instance manually.  (This is a walkthrough of what the git-sync-ec2 scripts are automating.)

First, start the instance:

```
aws ec2 start-instances --instance-ids <instance id>
```

Next, to push the local repo.

But we have to know where to push, so look up the name:

```
aws ec2 describe-instances --instance-ids <instance id> | jq ".Reservations[0].Instances[0].PublicDnsName"
```

If you're using ssh, unfortunately you cannot specify an identity file using git, so either you will have to login with your account
password when prompted or create an entry in the ssh config (this can be easily done with the storm tool installed above).

Push the repo.  You might want to add a test commit to make sure there is something to push.  Otherwise nothing will be pushed and
the deploy will not be run.

```
git push ssh://user@<instance name>/~/<path to repo>
```

During the push you should see the messages of your website being updated.

Stopping the instance is likewise done with the aws-cli command line:

```
aws ec2 stop-instances --instance-ids <instance id>
```

### Git Repo Setup (Local) ###

We will be using a set of scripts, called git-sync-ec2, to automate the above process.  With a git alias, it becomes trivial to make
`git push-ec2` work just like <code>git push</code>.

#### Installation ####

The scripts can be placed anywhere in your path.  They are simple bash scripts so have just the dependencies mentioned above.

#### Configuration ####

For these scripts to work, you need to set some config settings that the scripts can use to generate the URL of the EC2 instance and
connect.

The following settings are necessary:

* sync-ec2.instance-id - the EC2 instance id
* sync-ec2.user - user name of the account to use
* sync-ec2.protocol - git, http, or ssh *(TBD, for now ssh is assumed)*
* sync-ec2.identity-file - public key file for ssh config (only if using ssh)
* sync-ec2.repository-path - path to the repository on the server

You can set each of these with the following command template:

```
git config --local sync-ec2.instance-id i-YYYYYY
```

I suggest using local settings since every repository is likely to have different configurations.  Remember to put values in quotes
to avoid shell expansion.

#### Alias ####

Last, to make it part of the git workflow, add an alias for push-ec2:

```
git config --local alias.push-ec2 \!git-push-ec2.sh
```

Note: the ! in front of the alias is necessary or otherwise git will complain about the alias not expanding to a proper git command.

<h3>Ready, Pull!</h3>

Okay, so far we've only focused on pushing.  Still, if you work with multiple repositories, then you will have to pull to keep your
work in sync.

Thankfully we can leverage every piece of work so far.  Astute readers who have followed the instructions will probably have noticed
there is git-pull-ec2.sh script as well.  I bet you can guess where this is going…

Simply set the alias:

```
git config --local alias.pull-ec2 \!git-pull-ec2.sh
```

and voilà, you can pull just as easily as push.

### Conveniences (Optional, Local) ###

You've probably noticed the prompt:

```
The authenticity of host 'ec2-nn-nn-nn-nn.us-west-2.compute.amazonaws.com (nn.nn.nn.nn)' can't be established.
RSA key fingerprint is 9e:c8:28:18:04:8d:b0:90:99:93:4f:e4:ad:3a:d9:a5.
Are you sure you want to continue connecting (yes/no)?
```

Since the EC2 instance names are constantly changing, you will see this warning each and every time you push.  I was tired of seeing
it, so I turned it off.

To turn the warning off, you can add the following line to your ~/.ssh/config file.

```
StrictHostKeyChecking no
```

** Note: This is not a good security practice.  Please review the ssh documentation for the consequences of setting this option.**

## Legal Matters ##

### Disclaimer ###

This is pre-alpha software at best.  I use it, but I wouldn't recommend it for production use.

### License ###

This software is licensed under the [MIT License](http://opensource.org/licenses/MIT).

Copyright (c) 2013 Jay Kint

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

## To Do ##

* Per remote sync-ec2 configurations
* Protocol support besides ssh
* Support for push and pull command line options
