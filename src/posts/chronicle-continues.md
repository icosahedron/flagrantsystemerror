---
title: The Chronicle Continues
date: 2016-11-12
---  
# The Chronicle Continues #

[A while back](http://flagrantsystemerror.com/chronicle-of-an-app.html) I started an app, my first real mobile application.

As it is wont, life gets in the way, in particular finishing my degree.  As part of the degree program, I was required to do a Senior Project.  I chose to prototype the TaskPaper clone that I had imagined earlier.

(The project was to design the app, finish a prototype, and write a report on the project prototype.)

So far this prototype has evolved a bit to something a bit more functional.

![@Done Prototype][done-prototype]

[done-prototype]: images/done1.jpg

## Architecture Decisions So Far ##

@Done is an app meant to be used on multiple platforms.  As such, it requires a core that is cross platform, with as much code as possible shared between implementations.

There are many great x-plat mobile stacks, but I decided to go with Xamarin, mixed with some of the ideas from the React Native and Telerik stacks.  (I may detail the selection process I used in a later post.)

## C# ##

Xamarin is available everywhere, and I use C# enough to know it, so it comes partly as a comfort choice.  But also, Xamarin just works on these platforms.  Xamarin, and now Microsoft, are serious about cross platform, and it shows.

Also, by being based on .NET, I can leverage an entire ecosystem of libraries that are battle tested.  In particular, .NET has a very robust asynchronous model that is just now finding its way into other languages and runtimes.

It is true that there are plenty of stacks that came make the *sa*me claims, and they likely would have been just as valid choices.

## And Javascript ##

React Native and NativeScript both support the ability to update an application's Javascript logic outside the domain of the App Stores[^javascript-out-of-band].  This is a huge boon for an app, being able to fix bugs and improve applications in a timely manner.

[^javascript-out-of-band]: There are limits to what an update may contain according to Apple App Store rules.  It may not add new features or alter the functionality of your application significantly.  I doubt Google Play has such restrictions.

In addition, Hog Bay Software released a [javascript library](https://github.com/jessegrosjean/birch-outline) for manipulating TaskPaper documents.

I really liked the idea of out-of-band updates and it was too tempting to not use the library, so I've incorporated Javascript into the app.  Xamarin supports the iOS JavascriptCore runtime provided by Apple, so this was fairly simple.

It does mean that I might have to find or write an update service though.  Or it might be possible to use one of the React Native services that do this.

## Performance Woes ##

@Done's core is in C# and primarily is for loading Javascript and binding that to the UI.

To simplify this, I've been using [Redux.NET](https://github.com/GuillaumeSalles/redux.NET).  It works well, and I've been pleased with the results.  The flow is simple and it is easy to communicate between components without tightly coupling them.

However, Redux.NET (and Reducto, etc.) is purely synchronous.  As the app has grown, the performance has already impacted the UI's responsiveness.  I decided to take care of this before the problem becomes intractable.

The classic solution to this is to do the work in the background and then just update the UI in the main thread.  This means that you have to communicate between threads, usually asynchronously.  There are examples about how to use Redux.NET asynchronously, but it feels bolted on.

I thought of just creating a special API in Redux.NET, DispatchAsync, that would handle the dispatch for me, but that seems like a lot of work, and thankfully there are solutions already available.

## Akka Knowledge Meant ##

Akka.NET seems ideal.  It has many of the same characteristics as Erlang and Go:

* Asynchronous message passing
* Lightweight threads can handle millions of messages
* Linear Scalability

with very little management of the communication.  It just seems to work.

Also, it's written for C# and .NET and works with Xamarin.

I haven't made the adjustment yet, but I have done some initial tests, and they work very well.  I will follow up with how it goes.

*Edit: So it came quickly to my attention that Akka.NET will not work for my scenario.*

*I need to dispatch certain requests to the UI thread, and Akka.NET does not provide a way to easily receive messages on a specific thread.  Oh well.*

