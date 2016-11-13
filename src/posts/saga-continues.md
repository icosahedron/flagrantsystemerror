---
title: The Saga Is Not Done
date: 2016-11-12
index: true
---  
# The Saga Continues #

[A while back](http://flagrantsystemerror.com/chronicle-of-an-app.html) I started an app, my first real mobile application.

As it is wont, life gets in the way, in particular finishing my degree.  As part of the degree program, I was required to do a Senior Project.  I chose to continue the TaskPaper clone that I had started earlier.

Well, the app is coming along nicely.  I completed the project without completing the app.  The project was to design the app, finish a prototype, and write a report on the project.

So far this prototype has evolved a bit.

![@Done Prototype][done-prototype]

[done-prototype]: images/done1.jpg

## Architecture Decisions So Far ##

@Done is an app meant to be used on multiple platforms.  As such, it requires a core that is cross platform, with as much code as possible shared between implementations.

I decided to go with Xamarin, but using some of the ideas from the React Native and Telerik stacks. (I won't go through the selection process here.  Maybe in an another post.)

## C# ##

Xamarin is available everywhere, and I use C# enough to know it, so it comes partly as a comfort choice.  But also, Xamarin just works on these platforms.  Xamarin, and now Microsoft, are serious about cross platform, and it shows.  They've been in the game for a long time.

Also, by being based on .NET, I can leverage an entire ecosystem of libraries that are battle tested.  In particular, .NET has a very robust asynchronous model that is just now finding its way into other languages and runtimes.

It is true that there are plenty of stacks that came make the same claims, and they likely would have been just as valid choices.

## And Javascript ##

React Native and NativeScript both support the ability to update an application's Javascript logic outside the domain of the App Stores[^javascript-out-of-band].  This is a huge boon to an app, being able to fix bugs and improve applications in a timely manner.

[^javascript-out-of-band]: There are limits to what an update may contain according to Apple App Store rules.  It may not add new features or alter the functionality of your application significantly.  I doubt Google Play has such restrictions.

## You Got Your Javascript in My C#! ##


@Done contains a core in C# for loading Javascript and binding that to the UI.

To help in this, I'm using Akka.NET to handle the binding of messages between the two layers.  This way the UI thread will always be free and responsive, and the work will be done in the background.  Akka.NET handles the plumbing details.

