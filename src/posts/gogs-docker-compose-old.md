# Compose Yourself, Young Man #

Being a {~~lazy->good~~} engineer, I've decided to update my git server setup to be more automated (meaning driven by scripts and/or the command line).  What I really want is to eliminate the need to copy and sync things between the containers and the file system.  Ideally, when something is updated on the host machine, it will be updated in the docker containers too.

I'm still using Gogs, with an nginx reverse proxy (though that will likely be upgraded to HAProxy in the near future).

## Going Native ##

Docker containers on macOS can't mount any directory on the file system except the user's folder.[^docker-mount]

[^docker-mount]: It's weird, because it *seems* like it should be able to do so. There are preferences for which directories can be mounted, but I never could get them to work.

This made it a pain to maintain files for two scenarios:
* Let's Encrypt SSL certificates
* Git repo data/backups

Since `/etc/letsencrypt` can't be mounted in a Docker container, the certificates had to be copied either into the container or into a data volume that was mounted in the container, or into my home directory (which putting cert private keys in my home directory seems a bit sketchy).  When certs expired, as they do every 90 days with [Let's Encrypt certificates](https://certbot.eff.org/docs/using.html#getting-certificates-and-choosing-plugins), the process had to be repeated.  Hardly difficult, but a chore to remember.[^cron]

[^cron]: I could have used cron jobs to handle all of the filesystem syncs, but I wanted something more "integrated".

Git repos mounted in my home directory aren't much of a security concern, but the Docker `osxfs` file system is a performance concern, so I didn't want to mount them directly, so again I put them in a data volume (which probably isn't much faster).  Again this means that backups have to be synced out of the data volume.  Not hard, but again a chore nonetheless.

This time I decided to use a more "native" approach, which is to run Docker on Linux, in a Linux VM in this case. (I know, how can I consider a VM more "native"?)  While Docker can't mount the `/etc/letsencrypt` directory in macOS, it can do so on Linux. The VM in turn can access any shared folder on the Mac.

### Not All Who Wander Are Lost ###

Since I'm going for automated (which largely means scripted via command line here), I decided to use a [CoreOS](https://coreos.com) Linux VM managed via [Vagrant](https://www.vagrantup.com) (using the VirtualBox provider, since it's free).

Vagrant configures the VM to run via the Vagrantfile, a Ruby script that uses an API to bring up 

To start, I use the NFS provider.  The Virtual Box shared folder file system also has [performance concerns](https://www.jeffgeerling.com/blogs/jeff-geerling/nfs-rsync-and-shared-folder), and anyways I never could get the VirtualBox Guest Additions to install correctly, even with the [vagrant-vbguest](https://github.com/dotless-de/vagrant-vbguest/) plugin.




## Compose Yourself Young Man ##

In the [original article](http://flagrantsystemerror.com/git-docker-gogs.html), I used individual docker containers, one for Gogs itself, and an Nginx container as a reverse proxy to provide https support (as well as host some static files).  

This required two individual docker commands, which were uncoordinated.  In a coordinated application, even a simple one like this, the entire system should work together.  I could put Gogs and nginx into a single container, but this would void the modularity and require creating a custom image.

Instead it would be nice if the various containers were coordinated to launch together in the appropriate order, with other settings as necessary.  There are actually several options to do something like this.  The simplest, and one I'm using here, is [Docker Compose](https://docs.docker.com/compose/).  Others include [Docker Swarm, Kubernetes, and Mesosphere](https://insights.hpe.com/content/hpe-nxt/en/articles/2017/02/the-basics-explaining-kubernetes-mesosphere-and-docker-swarm.html), which are more capable and oriented towards clusters.

As the docs readily explain, Docker Compose can launch containers based on a configuration file, typically called `docker-compose.yml`.  This is a simple .yaml file that lays out the requirements for and dependencies between each container.  Before I introduce the compose file though, let's talk about the base system.

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
