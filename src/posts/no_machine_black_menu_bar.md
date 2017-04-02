# No Machine and the Black Menu #

At home I have a little server that I can log in to remotely.  Normally I do so using SSH because it's secure and fast.  However, I sometimes need a GUI.  After a lot of trial, I finally settled on [No Machine](https://www.nomachine.com/) as the remote desktop software of choice.

No Machine is fast and secure.  It travels over SSH and it uses some sort of better compression than Screen Sharing and RDP.  (It actually uses the open source [NX protocol](https://en.wikipedia.org/wiki/NX_technology).)  Basically, it's the only remote solution I've found that is usable over my network.

Except for one really annoying bug: the menu bar is black... with black text.  It's not the same as "dark mode".

![No Machine with Black Menu Bar][no_machine_black_menu_bar]

I've been able to fumble through just using the mouse, as only the bar is black, the menus themselves remain light and legible.

However, I was getting tired of the limitation, so a little research on the Etherwebs, and I was able to find a potential cause.

Apparently OS X Yosemite has a bug.  If a Mac doesn't have a display attached, then all sorts of oddities can occur over a remote connection.

[This thread](https://discussions.apple.com/thread/6627331?start=0&tstart=0) details similar problems to what I was experiencing, and offers a potential solution, [a display emulator](http://www.amazon.com/gp/product/B00FLZXGJ6/).

Well, dear reader, I have tried the solution and can attest that it does work.  If you have one of these display emulators, just plug it in and the computer believes it has a display attached.  This makes all the graphical oddities disappear.

![No Machine with White Menu Bar][no_machine_white_menu_bar]

So, if you find the black menu bar annoying or even impossible, this will solve it at the cost of a meal at your favorite fast food place.

[no_machine_black_menu_bar]: images/no_machine_black_menu_bar.jpg width="100%"
[no_machine_white_menu_bar]: images/no_machine_white_menu_bar.jpg width="100%"
