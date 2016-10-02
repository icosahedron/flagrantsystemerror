# Git on the Home Front (Setting up a Git Service in Docker) #

I have a little home server at which I keep a number of services that I use locally.  One of these is a [Gogs](https://gogs.io) server to house my personal code that I don't (yet) feel is ready for GitHub or other public repositories.

To keep it quasi-secure, I use https, and to do that, I use Let's Encrypt certificates.  Recently the certificate ran out, and I had to dig back through to see how I had set up the site so I could reset the certificate.

This is a record of how I set it up for my own records and perhaps for someone else who wants something simple to house their code.  I'm sure there are better ways to set this up and make it more automated, but this suffices for what I need, and I didn't want to spend too much time on it.

## On the Dock ##

To keep the set up as easy and isolated as possible, I use [Docker for OSX](http://www.docker.com/products/overview).  If you haven't used Docker recently, the latest version of Docker is much easier to administrate.  Gone is Virtual Box, instead Docker using the native virtualization of OSX (and Windows too).

Since I host other services as well, I use nginx as a reverse proxy.  As nginx has data that needs to persist across container invocations, I created a couple of volumes for it: one to hold the configuration and another to hold the web pages and other data.

```
docker volume create nginx-config
docker volume create nginx-data
```

With these set up, I set up nginx proper in docker, mounting the data and configuration volumes where nginx looks for them by default:

```
docker run --name nginx -v nginx-config:/etc/nginx -v nginx-data:/usr/share/nginx/html -p 80:80 -p 443:443 -d nginx
```

Now all web traffic to the server goes to the nginx docker container.

![Nginx Bare Screenshot][nginx-screenshot]

[nginx-screenshot]: images/nginx-screenshot.png width=512px

To host the Git data, I chose the Gogs server.  Gitlab is very nice, but it resource intensive, and I wanted something light.  Gogs, written in Go, fit that bill quite nicely.  As a bonus, it has many of the same features as GitHub and GitLab.

Like nginx, Gogs needs a separate volume to host the repository data.

```
docker volume create gogs-data
```

And with that, I created the Gogs docker container in a similar manner, mounting the volume in the data directory that gogs uses:

```
docker run --name=gogs -d -p 10022:22 -p 10080:3000 -v gogs-data:/data gogs/gogs
```

## Go Thy Way ##

Gogs was up and running, though not yet available via the normal www.  Instead, now that it was running, I had to configure it.

I used the configuration instructions from the [Gogs Docker Repository](https://github.com/gogits/gogs/tree/master/docker).

## Certifiable ##

Next came the nginx configuration to serve Gogs as a proxy.  Before setting up the configuration, it was necessary to procure the certificate to allow for secure communications (https).  The easiest way to do this is with Let's Encrypt.

Let's Encrypt provides very good documentation on how to install the certificate.  However, since I am running on OSX and nginx is running in a container, I followed the manual procedure[^manual-cert].

[^manual-cert]: In retrospect, it would likely be possible to perform the certificate retrieval and configuration in the containers themselves using `docker exec`

```
brew install certbot
sudo certbot certonly --standalone -d code.icosahedron.io
```

This placed the certificate in the /etc/letsencrypt/live/code.icosahedron.io.  From here, I had to place the certificate into the container.

```
sudo cp /etc/letsencrypt/live/code.icosahedron.io/fullchain.pem .
sudo docker cp fullchain.pem 26c6:/etc/nginx/ssl/code.icosahedron.io/fullchain.pem
sudo cp /etc/letsencrypt/live/code.icosahedron.io/privkey.pem .
sudo docker cp privkey.pem 26c6:/etc/nginx/ssl/code.icosahedron.io/privkey.pem
srm privkey.pm
```

Because Let's Encrypt uses symbolic links, it was necessary unfortunately to copy the private key and certificate chain to my user directory and then from there copy it to the nginx container into the proper directory.  Docker's cp command supposedly will follow a link with the -L parameter, but it didn't work for me.

## Start Your Ngin ##

Next came the configuration of nginx to 1) use https and the certificate and 2) serve up the gogs container.

```
# Configuration for code.icosahedron.io
#

server {

       listen       443 ssl;
       server_name  code.icosahedron.io;
       keepalive_timeout 30;

       ssl_certificate      /etc/nginx/ssl/code.icosahedron.io/fullchain.pem;
       ssl_certificate_key  /etc/nginx/ssl/code.icosahedron.io/privkey.pem;

       ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
       ssl_prefer_server_ciphers on;
       ssl_dhparam          /etc/nginx/ssl/code.icosahedron.io/dhparam.pem;
       ssl_ciphers 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-DSS-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-DSS-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-DSS-AES256-SHA:DHE-RSA-AES256-SHA:AES128-GCM-SHA256:AES256-GCM-SHA384:AES128-SHA256:AES256-SHA256:AES128-SHA:AES256-SHA:AES:CAMELLIA:DES-CBC3-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!aECDH:!EDH-DSS-DES-CBC3-SHA:!EDH-RSA-DES-CBC3-SHA:!KRB5-DES-CBC3-SHA';
        ssl_session_timeout 1d;
        ssl_session_cache shared:SSL:50m;
        ssl_stapling on;
        ssl_stapling_verify on;
        add_header Strict-Transport-Security max-age=15768000;

        charset utf-8;

        access_log  /var/log/nginx/code.access.log  main;
        error_log /var/log/nginx/code.error.log;

        client_max_body_size 50m;

        location / {
            proxy_buffers 16 4k;
            proxy_buffer_size 2k;
            proxy_pass http://server.kint.xyz:10080;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        error_page  404              /404.html;
        location = /404.html {
            root /usr/share/nginx/html;
        }

        # redirect server error pages to the static page /50x.html
        #
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   /usr/share/nginx/html;
        }
}

server {
    listen 80;
    server_name code.icosahedron.io;
    return 301 https://$host$request_uri;
}
```

The first server block exposes the gogs server on the domain code.icosahedron.io, and forwards all access to the port 10080, which is the port that docker has bound to the host side of the gogs server (3000, being the default port that gogs binds itself to on the container side).

The second block is a simple redirect from http to https.

## And We Go ##

With the certificates and configuration in place, I was able to start the nginx server and have it successfully serve the Gogs server.  Mission accomplished!

## Renewably Certifiable ##

Let's Encrypt is a wonderful service, but the certificates only last 90 days.  Thankfully, the renewal isn't much different from the original certificate request.

```
docker stop nginx
sudo certbot certonly
sudo docker cp fullchain.pem 26c6:/etc/nginx/ssl/code.icosahedron.io/fullchain.pem
sudo cp /etc/letsencrypt/live/code.icosahedron.io/privkey.pem .
sudo docker cp privkey.pem 26c6:/etc/nginx/ssl/code.icosahedron.io/privkey.pem
srm privkey.pm
docker start nginx
```

## He's Dead Jim ##

What happens if something goes wrong?  There are a couple of things to help you diagnose problems.

The first is `docker log <container>`.  This will show you the log from the container that you look at.  When I first copied over the certificate and private key, since they were symbolic links, the links on the container didn't exist, so nginx wouldn't boot.  `docker log` showed me why the nginx container wouldn't stay up when running.

The second is `docker exec -ti <container> bash`.  This will put you at a shell in the container as root.  Here you can look around to see what might be wrong.

When initially doing the certificate renewal, I found I had screwed up the nginx configuration and the container wouldn't boot, I had to create another container to mount the nginx-config volume to be able to fix the problem.

```
docker run --name nginx-conf -v nginx-config:/etc/nginx -d bashell/alpine-bash /bin/true
docker exec -it <container> bash
```

I was able to fix the problem and exit the shell, bring down the container, and restart the nginx container.

## Simple ##

This is a simple set up that creates a Git hosting server for myself.  In addition, Gogs allows me to mirror other repositories I'm interested in.

The certificate handling is largely manual, but it is straightforward to understand, and I like to keep things simple.
