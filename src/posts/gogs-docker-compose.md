---
title: Gogs Git Server with Nginx on Docker using Docker Compose
date: 2017-02-18
index: true
---

# Gogs Git Server with Nginx on Docker using Docker Compose #

I've updated my Gogs Docker configuration, so I thought I would post what I've learned here in case others might find it useful.

In the [original article](http://flagrantsystemerror.com/git-docker-gogs.html), I used individual docker containers, one for Gogs itself, and an Nginx container as a reverse proxy to provide https support (as well as host some static files).  

This required two individual docker commands, which were uncoordinated.  In a coordinated application, even a simple one like this, the entire system should work together.  I could put Gogs and nginx into a single container, but this would void the modularity and require creating a custom image.

Instead it would be nice if the various containers were coordinated to launch together.  There are actually several options to do something like this.  The simplest, and one I'm using here, is [Docker Compose](https://docs.docker.com/compose/).  Others include [Docker Swarm, Kubernetes, and Mesosphere](https://insights.hpe.com/content/hpe-nxt/en/articles/2017/02/the-basics-explaining-kubernetes-mesosphere-and-docker-swarm.html), which are more capable and oriented towards clusters.

As the docs readily explain, Docker Compose can launch containers based on a configuration file, typically called `docker-compose.yml`.  This is a simple .yaml file that lays out the requirements for and dependencies between each container.  Before I introduce the compose file though, let's talk about the base system.

In our previous article, I used Docker on macOS, hosted on a Mac mini.  This largely worked well, with some minor inconveniences with the macOS filesystem.

## Going Native #

Perhaps the single biggest inconvenience with the former set up was providing the [Let's Encrypt certificates](https://certbot.eff.org/docs/using.html#getting-certificates-and-choosing-plugins).  Since the macOS `/etc/letsencrypt` directory couldn't be imported directly into the nginx container, it was necessary to either copy the certificates to the nginx container or mount a data volume that contained the certificates.  I opted for the simple approach last time and simply copied the certificates to the nginx container.

This time I decided to use a more "native" approach.  While Docker can't mount the `/etc/letsencrypt` (and many other) directory in macOS, it can do so on Linux. I decided to run the containers in a Linux VM so that the containers could access the entire filesystem.

(I realize that I could use data volumes for this, and at some point I might do so, but this was the simplest way I knew at the time.)

I spun up a Debian Jessie VM in VirtualBox, calling it, strangely enough, `dockervm`.  I also shared a folder between the Mac mini and Linux VM.  The shared directory was at `~/icosahedron/share/docker` on dockervm.

## Compose Yourself, Young Man ##

After setting up the router to open up http and https to and acquiring the certificates using `certbot certonly` on dockervm, it was time to actually include Gogs and nginx.

Perhaps the simplest way is to show the file and then explain it:

```
version: '3'

services:
  gogs:
    image: gogs/gogs
    hostname: code
    domainname: icosahedron.io
    container_name: gogs
    networks:
      - dockervmnet
    volumes:
      - gogs-data:/data
  nginx:
    image: nginx
    hostname: home
    domainname: icosahedron.io
    container_name: nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /home/icosahedron/share/docker/nginx/etc/nginx:/etc/nginx
      - /home/icosahedron/share/docker/nginx/usr/share/nginx:/usr/share/nginx
      - /etc/letsencrypt:/etc/letsencrypt
    networks:
      - dockervmnet
    depends_on:
      - gogs

volumes:
  gogs-data:
    external: true

networks:
  dockervmnet:
    driver: "bridge"
```

Docker Compose is currently at version 3, so I've put that as the version to use.

### Services ###

This section outlines the containers to be created and their parameters.

The first service, gogs, is hopefully straightforward to those who know the docker command line.  The equivalent docker run command would be

```
docker run --name gogs -v gogs-data:/data -p 3000:3000 gogs/gogs
```

Two things of note:

* In the compose file we don't have to expose the ports due to `networks`, which I will discuss more below.
* I use a data volume for the data (repos, etc.) rather than native file system.  This was simplest since I had a number of repos already within the volume.

The second service, nginx, is again largely similar to its docker run command (clipping some of the volumes for brevity):

```
docker run --name nginx -p 80:80 -p 443:443 -v /etc/letsencrypt:/etc/letsencrypt ... nginx/nginx
```

Again, two things of note:

* I explicitly call out the dependency, which allows Docker Compose to know that it must start gogs before it starts nginx, something the command lines don't do.
* I can mount the directories directly rather than use volumes.  This makes certificate renewal (potentially) much easier.  Also, content can be updated much easier since I only have to copy it to a new directory rather than into a container.  (There are trade-offs for doing this.)

### Docker Speaks Volumes ###

The `volumes` section simply names the gogs-data volume as being available and that it was already created externally.  Docker Compose can create the volumes for you, but since we had a volume already containing our repos for Gogs, we mark it external.

### Networking in Docker Compose ###

Docker Compose creates a network among all the containers that are listed in the services.  This is convenient, but can be a bit confusing if you've not used them before.  As indicated in the compose file, we named our network dockervmnet.

It's pretty simple:

* Containers are on their own network with the address 172.19.0.0/16
* Containers reference each other via their names.
	* Docker sets up an internal DNS with each container name as the host name
* Use `docker network list` to see the networks, and `docker inspect <network>` to see the details of each container in the network, including its address.

The nginx config for our proxy to Gogs references the Gogs container name (conveniently titled 'gogs' in the `proxy_pass` directive):

```
       location / {
            proxy_buffers 16 4k;
            proxy_buffer_size 2k;
            proxy_pass http://gogs:3000;
            proxy_read_timeout 30;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_http_version 1.1;
            proxy_set_header Connection "";
        }
```

## Deep Breaths to Compose ##

With the containers defined, to bring them up together (including creating the network), use

```
docker-compose up -d
```

where -d tells Compose to put the containers in daemon/background mode.  Verify they are all up with `docker ps`.  If you receive an error, `docker logs <container>` is your friend.

To stop the containers, use 

```
docker-compose down
```

There are other commands too, but these two are all I use.

## Up Next ##

This is a good base to build on, and it functions as a great git server.  However, the certificates still require attention every 90 days, so I would like to automate their renewal.  Fortunately, others have blazed the trail before, so I will set up one of their containers within my compose file.  (I'm currently leaning towards [this container](https://hub.docker.com/r/bringnow/letsencrypt-manager/).)

As always, if you know of a better way to do something, or wish to share some other insight, I can be reached on the addresses on the Contact page.




