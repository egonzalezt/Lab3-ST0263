# Lab3-ST0263

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#objetive">Objetive</a></li>
    <li><a href="#how-i-design-it">How I design it</a></li>
    <li><a href="#setup">Setup</a></li>
        <ol>
            <li><a href="#docker">Docker</a></li>
            <li><a href="#nginx-1">Nginx</a></li>
            <li><a href="#react">React</a></li>
            <li><a href="#express">ExpressJs</a></li>
            <li><a href="#mongodb">Mongodb</a></li>
        </ol>
    <li><a href="#demo">Demo</a></li>     
  </ol>
</details>

## Objetive

The objetive of this project is to deploy a monolitic application build using MERN(Mongo, Express, React, Node) provided by the teacher, the idea is use docker on React and Express but Mongodb running local on AWS EC2 Machine, and the React front-end require HTTPS using SSL provided by Let's Encrypt.

"El proyecto a desplegar en este laboratorio es una aplicación web. La aplicación permite visualizar una colección de recursos, para efectos de este caso, libros. Igualmente, cuando el usuario selecciona alguno de los recursos, se ofrece una vista con información detallada sobre el recurso seleccionado. La información de los recursos (libros) se encuentra almacenada en base de datos. La aplicación tiene tres (vistas): raíz (“/”, home), descripción detallada de los recursos libros y acerca de."

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
### Docker

Please follow this guide from the last Lab to install docker and docker-compose [Setup Docker](https://github.com/egonzalezt/Lab2-ST0263#install-docker) 

### React

The main reason to use docker is to isolate the dependences to avoid problems on the EC2 Machine, react will use docker-compose and Dockerfile when the machine starts or the container fails restart automatically, Dockerfile and docker-compose are located on this repo on frontend folder.

When everthing is done please run this command where is located your docker-compose.yml 

```bash
sudo docker-compose up -d
```

### Express

The main reason to use docker is to isolate the dependences to avoid problems on the EC2 Machine, react will use docker-compose and Dockerfile when the machine starts or the container fails restart automatically, Dockerfile and docker-compose are located on this repo on backend folder.

When everthing is done please run this command where is located your docker-compose.yml 

```bash
sudo docker-compose up -d
```

### Mongodb

Follow the guide provided by Mongodb team to install Mongodb Community edition on your AWS EC2 Machine [Setup Mongo](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/) 

#### Create super user

afther mongodb installation is done inside your EC2 machine please run 
```bash 
mongo mongodb://localhost:27017
```
inside mongoshell run this to create admin user

```mongo
> use admin
> db.createUser(
{
user: "Admin",
pwd: "myNewPassword",
roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
}
);
```
run this to create regular user who has only access to bookstore db

```mongo
> use admin
> db.createUser({
      user: "lab3",
      pwd: "lab3bookstore",
      roles: [
                { role: "userAdmin", db: "bookstore" },
                { role: "dbAdmin",   db: "bookstore" },
                { role: "readWrite", db: "bookstore" }
             ]
  });
 ```
if everything is ok mongo returns a message like {ok}
 
Now enable the authorization on mongo db conf file 
```bash
sudo nano /etc/mongod.conf
```
locate this section
```yml 
## security:
```

Modify like this

```
security:
authorization: "enabled"
```
Finally restart the service

```
sudo service mongodb restart
```

#### Connect to database

To connect to the database on the backend using mongoose the database url look like this

```bash
mongo "mongodb://${DBUSER}:${DBPASSWORD}@<host>:<port>/<dbname>?authSource=admin"
```

## Demo 

[Visit Bookstore](https://lab2.daves.tk/) 

When you visit the webpage you will see 

![image](https://user-images.githubusercontent.com/53051438/163698278-1223733f-205a-4dd7-a666-ca2890e88c94.png)
