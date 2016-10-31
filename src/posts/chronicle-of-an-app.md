# Chronicle of an App

I have been working on an app. My favorite task/to-do list, TaskPaper, was discontinued, and I really haven't found one I
liked to replace it. And for everything I liked about TaskPaper, there were things I wished it had.

I also decided that I hadn't been blogging enough, so I thought why not merge the two endeavors.

This will be a series about the creation of the app, what decisions will go with it, and also tutorials on how I developed certain
interesting portions of it.

## What Is TaskPaper?

Before going into my app, I should explain a little about TaskPaper.

TaskPaper is a simple project/task/note taking app created by [Hogbay Software](http://www.hogbaysoftware.com/products/taskpaper).
Its simplicity is that it uses tags for simple categories/contexts in a plaintext file. You can easily enough follow David Allen's
GTD, or easily just use it as a to-do list.

A sample document might contain something like this:

```
Party:
- Invitation List @next @spouse
- Reserve park @waiting_for(parks_and_rec) @calls
- Menu @weekend @shopping
    Hamburgers
    Hot dogs
    Buns
    Condiments
    Veggie Tray
```

TaskPaper used to have an iOS version, but that was discontinued. Now there is just an OS X version, which I still use and enjoy.
But the iOS version was very handy because I could see and update my tasks on my portable devices.

I found I enjoyed the simplicity and the ability to take my tasks anywhere.

## Just Another TaskPaper?

While I do miss TaskPaper, I am not looking to simply replace it. If I wanted to do that, I could simply download and recompile the
[source code](https://github.com/jessegrosjean/NOTTaskPaperForIOS) that Mr. Grosjean graciously provided.

Instead, it is my intention to build upon that foundation and make a tool that would be (more) helpful and allow me to adjust it to
my workflow. How would I do that?

Well, it certainly is too easy to make lists of features , and I won't do that here. Far too early to make any promises. :)
But TaskPaper compatibility is indeed a mandatory feature. Also, it will be cross platform, at least iOS and Windows
Phone[^windowsphone]. Android, OS X, and Windows Desktop would come later.

[^windowsphone]: I have had the recent pleasure of developing for Windows Phone. The tools are far better than about anything else
out there and the Windows app market is woefully underserved.
