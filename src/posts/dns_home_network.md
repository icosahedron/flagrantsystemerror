# DNS on Home Network #

I have a small home network which has a website (not this one), a code repository, a PC for the kids, a printer, and some VMs running various services.  With only a few machines, I long procrastinated setting up a way to resolve the names and just manually remembered the several IP addresses.  Finally tired of this situation (and sick at home from work), I finally installed DNS.

*Disclaimer: There might be a better way to do this.  If you believe this set up could be made better, please drop me a note. I am by no means an expert and would welcome guidance.*

My network is anchored by a Mac Mini, so that is the logical place to install the DNS server.  [Dnsmasq](http://www.thekelleys.org.uk/dnsmasq/doc.html) seems to be the small server of choice for DNS (and DHCP, TFTP, and a few other protocols).

With macports, it's as easy as 

```
sudo port install dnsmasq
```

and you're ready to go.  Homebrew also has an easy Dnsmasq installation available.

## DNS, DNS, Wherefore Art Thou DNS? ##

To use DNS, the machines on the network have to know where to find the DNS server.  This is a job for DHCP.

To manage things centrally, we want Dnsmasq to manage the DHCP as well as the DNS, so I needed to turn off the DHCP server on the Apple Airport.  Which really means that I set the DHCP range to really small (10.0.1.253-10.0.1.254) and created some bogus MAC addresses to be reserved so that it wouldn't allocate any DHCP addresses or answer any requests, since you can't really turn off the DHCP server and just use the NAT on an Airport router.

!["Turn off" DHCP in an Airport router][airport_dhcp_off]

[airport_dhcp_off]: images/airport_dhcp_off.jpg width=640px

That done, it was time to configure Dnsmasq to return some IP addresses.

Fortunately this is easily done, as Dnsmasq has a very well documented example configuration file (installed as */opt/local/etc/dnsmasq.conf.example* by macports).  Searching the configuration file, it's relatively easy to find the place where DHCP allocations are set.  After copying the file to an actual configuration file by removing the example extension and reading the various commented explanations, I settled on this configuration (comments removed for brevity, details changed to protect the innocent):

```
dhcp-range=10.0.1.50,10.0.1.150,255.255.255.0,24h

dhcp-host=aa:bb:cc:dd:ee:ff,code,10.0.1.7
dhcp-host=aa:bb:cc:dd:ee:ff,server,10.0.1.6
dhcp-host=aa:bb:cc:dd:ee:ff,pi,10.0.1.5
dhcp-host=aa:bb:cc:dd:ee:ff,pc,10.0.1.4
dhcp-host=aa:bb:cc:dd:ee:ff,printer,10.0.1.3

dhcp-option=option:router,10.0.1.1
dhcp-option=option:dns-server,10.0.1.6
```

The last line answers our main concern, where to find the DNS server.  The router is still the Airport, so set to 10.0.1.1.  Otherwise, we have some known addresses and everyone else receives an IP between 10.0.1.50 and 10.0.1.150.

## A Computer by Any Other Name ##

To carry the vague Shakespearian references further, it is now time to configure the DNS entries.  Again, the example configuration file is very helpful, and through reading it, I was able to determine what was needed.

The first task is to make sure that our DNS service can find names on the Internet.  Dnsmasq has the ability to forward DNS requests to another server if it does not know how to satisfy a request.  This is the task of a resolver. Normally, the resolver exists at /etc/resolv.conf and Dnsmasq will use it if it's available.  However, /etc/resolv.conf is generated and can be changed by the OS.  To simplify and make the experience more consistent, I use the optional resolv.conf setting in Dnsmasq:

```
resolv-file=/opt/local/etc/resolv.conf
```

And I set the custom resolv.conf file to:

```
domain kint.home
nameserver 8.8.8.8
nameserver 8.8.4.4
```

So my DNS server will forward all queries that it can't answer to the Google DNS servers.

For addresses that Dnsmasq knows about, it became quickly obvious that there are many ways to resolve names to addresses.  I chose perhaps the simplest one: a hosts file.

Not the /etc/hosts file, though that was a choice.  Instead, I just chose to use Dnsmasq's additional hosts file option and configured.

```
no-hosts
addn-hosts=/opt/local/etc/dnsmasq.hosts
```

The `no-hosts` option tells Dnsmasq to ignore the /etc/hosts file, and the `addn-hosts` option tells Dnsmasq to look for more hosts in the file it points to.

The hosts file I created is very straightforward:

```
127.0.0.1       localhost
255.255.255.255 broadcasthost
::1             localhost
xx.yy.zz.ww    printer printer.kint.home
...
xx.yy.zz.ww    whatever whatever.kint.home
```

There are other ways, including specifying the known hosts directly in the configuration file, but this seemed easiest to me.

## Resolve to meet the VPN Constantly ##

So far, this configuration worked great for my network.  Then I logged in to my VPN on my Macbook Pro and none of the local domains would work!

I investigated this for a while, and never could exactly figure out why this is.  `scutil --dns` shows a new resolver when I'm connected to the VPN, but I'm not sure how it's being set.  I suspect that the VPN connection has its own DHCP that returns a DNS address of its own.  *If you know more about this, please write me so I can investigate further.*

Fortunately I was able to find a work around for the Mac.  Actually, there were a couple of potential work arounds, but I chose the one I thought the easiest of the two.

The first, that I didn't pursue, was to use the [/etc/ppp/ip-up and /etc/ppp/ip-down](http://hints.macworld.com/article.php?story=20011125025933762) scripts in combination with scutil.

The second, and easier, is the use of the `/etc/resolver` directory.  There are some great [blog](http://blog.scottlowe.org/2013/08/14/using-your-home-dns-servers-with-corporate-vpns/) [posts](http://passingcuriosity.com/2013/dnsmasq-dev-osx/) about configuring DNS using this directory, so I won't go in to too much detail other than to say that my configuration file, /etc/resolver/home, looks like this:

```
nameserver 10.0.1.6
```

Adding this file fixed the problem on the home network laptops, but the tablets still require that they be disconnected from the VPN to use the local hostnames. :(

## All's Well the Resolves Well ##

Now the machines on the network can talk to each other by name and I can tell my family "printer.kint.home" is the name to type in to their dialog box when adding the printer.

Hopefully you've found this useful and can save some time from my research.  As always, I welcome questions, advice and critique.  How do you have DNS working on your home network?
