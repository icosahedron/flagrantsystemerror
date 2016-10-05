---
title: "DNS on Home Network Through VPN"
date: September 2, 2015
---
# DNS on Home Network Through VPN #

TL;DR; Summary: You can set the NS record of a domain you own to your home network. If you let DNS pass through to your internal
server, it will resolve the names on your network to their internal addresses. Of course, this is only useful if you are at home.

*This is a continuation of setting up [DNS on your home network.](http://flagrantsystemerror.com/dns_home_network.html)*

The last entry was a simple foray into installing DNS on a small home network. As noted though, the home network wasn't visible
when the tablets or other electronics that were connected to a VPN. Presumably this is because the VPN has its own DHCP (or similar)
settings that provide their own DNS.

## How DNS Finds Your Domain ##

First, a little background on how DNS works.

When using DNS in your home network, your computer uses the local DNS server to resolve any host names. If the server doesn't know
the address, it forwards the request to another DNS server to resolve.

Public DNS works the same way. When you search for a name, your DNS server may not know the address, so it relies on other,
authoritative, servers.

Here's the `dig` trace for kint.xyz:

```
jaykint@Dads-MacBook-Pro ~/dev/udptty/ dig +trace kint.xyz

 <<>> DiG 9.8.3-P1 <<>> +trace kint.xyz
;; global options: +cmd
.           5129    IN  NS  b.root-servers.net.
.           5129    IN  NS  j.root-servers.net.
.           5129    IN  NS  e.root-servers.net.
.           5129    IN  NS  c.root-servers.net.
.           5129    IN  NS  h.root-servers.net.
.           5129    IN  NS  f.root-servers.net.
.           5129    IN  NS  i.root-servers.net.
.           5129    IN  NS  a.root-servers.net.
.           5129    IN  NS  m.root-servers.net.
.           5129    IN  NS  k.root-servers.net.
.           5129    IN  NS  d.root-servers.net.
.           5129    IN  NS  l.root-servers.net.
.           5129    IN  NS  g.root-servers.net.
;; Received 228 bytes from 8.8.8.8#53(8.8.8.8) in 449 ms

xyz.            172800  IN  NS  x.nic.xyz.
xyz.            172800  IN  NS  y.nic.xyz.
xyz.            172800  IN  NS  z.nic.xyz.
xyz.            172800  IN  NS  generationxyz.nic.xyz.
;; Received 282 bytes from 199.7.83.42#53(199.7.83.42) in 416 ms

kint.xyz.       3600    IN  NS  home.icosahedron.org.
;; Received 56 bytes from 212.18.249.42#53(212.18.249.42) in 75 ms

;; Received 26 bytes from 67.183.147.81#53(67.183.147.81) in 37 ms
```

You can likely divine what is happening here. The .xyz domain is held in the root servers (aptly named `root-servers.net`), which in
turn refer to the xyz authoritative domain servers (`x.nic.xyz`, etc.). These servers know about kint.xyz and deliver the NS record,
which is my home server `home.icosahedron.org`.

There is a fairly good [introduction to DNS](http://www.internetsociety.org/sites/default/files/The%20Internet%20Domain%20Name%20System%20Explained%20for%20Non-Experts%20%28ENGLISH%29.pdf)
published by the Internet Society if you would like more details.

## Home DNS via VPN ##

A little bit of information goes a long way. So, we know we have to somehow make our DNS server available to the internet. But first
things first. We need a domain that works on the public internet.

In the previous article, I used kint.home. Well, .home isn't (yet) available as a domain suffix (TLD), so I needed to pick another
name. My registrar of choice, [gandi.net](http://gandi.net), has .xyz domains for cheap. kint.xyz it is!

### Punching Holes ###

To be able to reach the authoritative server for kint.xyz (my home server), DNS must be forwarded through the firewall. This is left
as an exercise to the reader (since it will depend on your router). (Hint: UDP port 53 is the port to forward.)

### Setting NS to Your Home Network ###

With your own authoritative server, you simply have to set your domain's NS record to your home network.

Ah, but to set the NS record, you need an IP address to set it to! (Really, the NS record contains a hostname, but *that* has to
resolve to an IP address at least.) If your ISP is like mine, then you have a dynamic address. Well, dynamic DNS to the rescue, but
I'll leave that for the next article.

My home network is available at home.icosahedron.io. Using Gandi's tools, it's simply a matter of setting the DNS server for the
domain to our home domain.

![Gandi DNS Settings][gandi_dns]

[gandi_dns]: images/gandi_dns.png width=570px

### Security Implications ###

I'll be honest, there are security implications to exposing your DNS server to the public internet. There are security implications
in exposing <em>anything</em> to the public internet. However, in my research there was no information about concrete attacks from
doing this, so I elected to do it for convenience.

To each their own.

## Printer Online ##

With this set, I can now enter my printer name as printer.kint.xyz on my tablet, and it works! Only if I'm actually at my house of
course.

*Please give any feedback, corrections or advice to jkint@flagrantsystemerror.com*
