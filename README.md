# Lab3-ST0263

## Objetive

The objetive of this project is to deploy a monolitic application build using MERN(Mongo, Express, React, Node) provided by the teacher, the idea is use docker on React and Express but Mongodb running local on AWS EC2 Machine, and the React front-end require HTTPS using SSL provided by Let's encript.

## How I design it

For the monolitic Application i decided to split the application on 4 Layers to apply High cohesion that each layer do only the work that is asignated(back do back, front do front and db only store).

![layers](https://user-images.githubusercontent.com/53051438/163697251-c0d155c8-9c59-4523-aa13-0058aa4ad7c9.png)

### Front and Back

The BookStore front and back is provided by the teacher jcmontoy@eafit.edu.co and build it on docker containers.

### Mongo

The database Mongodb is the Community version running local on AWS EC2 Machine with two users, super user and regular user(access only to schema bookstore), to access to this db is required that admin or regular user autenticates before use the db or schemas.

At this moment the database has a public ip address but only accepts requests from the backend EC2 machine setting on the security group.

### Nginx 

Nginx is working on another AWS EC2 machine working as proxy, this is the most important layer because this layer give access to the user to the website, this proxy is who manage ssl certificates provided by certbot.

## Setup 

### Nginx

Nginx is the same configuration as the last Lab [How to setup Nginx](https://github.com/egonzalezt/Lab2-ST0263#nginx) with the different that I use subdomains to use the same domain for the lab2 and the lab3. 

Follow the steps provided on the Lab2 to install Nginx.

```bash
server {
            listen 80;
            server_name daves.tk;
            rewrite ^(.*) https://$host$1 permanent;
}

server {
    listen 443;
    server_name daves.tk;
    ssl on;
    ssl_certificate /etc/letsencrypt/live/daves.tk/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/daves.tk/privkey.pem;
    proxy_redirect off;
    location / {
        proxy_set_header        Host $host:$server_port;
        proxy_set_header        X-Real-IP $remote_addr;
        proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_>
        proxy_set_header        X-Forwarded-Proto $scheme;
        proxy_pass http://172.16.238.201/;
    }
}
```

To work with subdomains please generate your cert for the new subdomain 
```bash
sudo certbot --nginx certonly -d lab2.daves.tk -d www.lab2.daves.tk
```

After this section of code add

```bash
server {
  listen 80;
  server_name lab2.daves.tk;
  rewrite ^(.*) https://$host$1 permanent;
}

server {
  listen 443 ssl;
  server_name lab2.daves.tk;
  ssl_certificate /etc/letsencrypt/live/lab2.daves.tk/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/lab2.daves.tk/privkey.pem;
  location / {
  proxy_pass http://172.31.80.153/;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "Upgrade";
   }
}
```
Test if everything is ok

```bash
sudo nginx -t
sudo service nginx restart
```