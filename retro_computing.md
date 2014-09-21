# Retro Computing Rabbit Hole #

Recently I stumbled upon the [ANTIC Atari 8-bit Podcast](http://ataripodcast.libsyn.com/).  This lead me away from current projects and down a rabbit hole into a new hobby, "retro computing."

As the Atari 8-bit line were my first computers (first an Atari 400, then an Atari 800XL) and I had a couple sitting in an old box, this was my chosen platform for the rekindled interest.

But what to do to get them up and running?  Computers need software to be interesting, but my collection of disks was certainly old and most likely demagnetized by sheer age.  And that's even assuming that the Atari 1050 drive I have would still work.

There are [emulators](http://www.xl-project.com/), and those are great, but nothing really beats the feel of using the original hardware, as much as possible.

## The Setup ##

After a bit of work, I was able to track down some hardware to make this a reality.

![Atari 800XL Set Up][atari_8bit_setup]

As you can see, I'm just about to sit down and enjoy a game of Seven Cities of Gold.  Definitely one of my favorite games from the 8-bit era.

## Video ##

The first challenge was to be able to see something.  They don't make TV's that have the RF inputs any more.

There are several ways to accomplish video, but I wanted to have something that would run on my computer (a Macbook Pro as pictured above), since I would have to host the disk images there.

The solution is in two parts.

The first part is getting the video signal from the Atari to something that can be understood by today's video technologies.  I found a cable through E-bay that converts from Atari's 5-pin DIN to RCA.  It is nearly identical to the one at [8bitclassics.com](http://8bitclassics.com/Atari-800-XL-XE-5-Pin-DIN-S-Video-Cable.html).

The second part is the video input into the Mac.  Again, there are quite a few solutions on the Internet, but my local Best Buy had only a single one that worked, Ion Audio's [Video 2 PC](http://www.ionaudio.com/products/details/video-2-pc-mkii).  

![Video Input][ion_audio_video2pc]

It seems to do the job rather well.  The software to display the video is EzCap, which can be downloaded from the ION Audio website or comes on the included CD.

The only hang up has been recording video.  Supposedly the EzCap software can record video, but it doesn't work with the Atari.  Instead I use a screen capture program, ScreenFlow, which captures the video just fine.

## Disk ##

Now that we can see what we're doing, we need something to do.

As mentioned above, I have a 1050 disk drive and even several floppies from the early to mid 80's.  You can imagine that those are not likely to be good still.  (I should send them data recovery place to see if they can be salvaged.)

Luckily time has not stood still for disk drive emulation.  Most people who are familiar with Atari 8-bit retro computing know of the [SIO2PC](http://atarimax.com/sio2pc.html) and the [APE](http://atarimax.com/ape.html) (Atari Peripheral Emulator) software.

![SIO2PC (USB)][sio2pc]

The SIO2PC hooks right into the USB port.  It does use the USB Type B connector, which aren't as popular as they used to be, so you probably would want to pick up the cable that is sold on the Atarimax website.

Being on a Mac, the APE software only works on Windows, so you'll have to have a Windows in a VM.

## Up and Running ##

Add a joystick, and rediscover your childhood!

![Playing a Game on the Atari][playing_the_atari]

## What's Next? ##

I've also discovered that the BBS is not dead! We'll connect to some BBSs with the Atari.

[atari_8bit_setup]: images/atari_8bit_setup.jpg width="512px"
[ion_audio_video2pc]: images/ion_audio_video2pc.jpg width="512px"
[sio2pc]: images/sio2pc.jpg width="512px"
[playing_the_atari]: images/playing_the_atari.jpg width="512px"

