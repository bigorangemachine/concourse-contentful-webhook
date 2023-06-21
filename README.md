Readme.md is WIP!

# Install

`./init.sh`

# Build Docker

Setup for the first time

```
docker build . #build the docker file
docker image ls # get the docker sha
docker run -i -t <DOCKER-IMAGE-ID> /bin/ash # run interactive
docker build -t comicrelief/concourse-contentful-webhook:v1 .
docker ps -a # get the docker container id
docker commit -m "first commit" -a "comicrelief" <DOCKER-CONTAINER-ID> comicrelief/concourse-contentful-webhook
docker push comicrelief/concourse-contentful-webhook
docker tag <DOCKER-IMAGE-ID> comicrelief/concourse-contentful-webhook:v1
docker push comicrelief/concourse-contentful-webhook:v1
```

## Build Dockerfile

`docker build . `

then test your changes

```
docker image ls # get the docker sha
docker run -i -t <DOCKER-IMAGE-ID> /bin/ash # run interactive
```

Type `exit` to exit docker interactive (`-i -t`).


## Debug from docker
Run in interactive mode `docker run -i -t <DOCKER-IMAGE-ID> /bin/ash` then from that terminal you can test inputs `printf "{\"only\":\"a-test\"}"|./check`


## Debug from fly/hijack/intercept

`fly -t tutorial intercept --check hello-world/cc-hooks`

# Setting up local concourse

Don't do this!  Tried to run locally but Darwin worker is an issue with `git`.

```
pg_ctl -D /usr/local/var/postgres -l /usr/local/var/postgres/server.log start
```

```
ssh-keygen -t rsa -f host_key -N '' && ssh-keygen -t rsa -f worker_key -N '' && ssh-keygen -t rsa -f session_signing_key -N ''
cp worker_key.pub authorized_worker_keys
```


```
concourse web \
  --basic-auth-username concourse \
  --basic-auth-password the_password_you_gave_earlier \
  --session-signing-key session_signing_key \
  --tsa-host-key host_key \
  --tsa-authorized-keys authorized_worker_keys
```

# Concourse Quick start

But we used the docker compose (quickstart) as [indicated here](https://concoursetutorial.com/)

```docker-compose up -d```

fly locally
```
fly -t lite login -c http://127.0.0.1:8080
```
User: `concourse`
Pass: TS004 Auth


```
sudo concourse worker \
  --work-dir /opt/concourse/worker \
  --tsa-host 127.0.0.1:2222 \
  --tsa-public-key host_key.pub \
  --tsa-worker-private-key worker_key
```

# Implemtnation

`/api/v1/teams/main/pipelines/[PIPELINE-NAME]/resources/[RESOURCE-NAME]/check/webhook?webhook_token=[RANDOM-TOKEN]`

The `pipeline.yml`

```
resources:
  - name: git-website-develop
    type: git
    webhook_token: [RANDOM-TOKEN]
    source:
      uri: git@github.com:USER/REPO
      branch: develop
      private_key: ((github-private-key))
```


## Setup Pipeline Resource

### Configure the Resource type

```
resource_types:
...
  - name: concourse-contentful-webhooks
    type: docker-image
    source:
      repository: comicrelief/concourse-contentful-webhook
...
```

### Configure the Resource

```
resources:
...
  - name: contentful-hook
    type: concourse-contentful-webhook
    webhook_token: <Some-Secret>
...
```

Note: Refer to [Concourse CI Docs](https://concourse-ci.org/resources.html) for `webhook_token` documentation

### Source Configuration

* `environment`: Environment of Contentful (`master`/`staging`) defaults to `master`

* `space-id`: Unique Space ID from Contentful

* `access-token`: Generated API Token from Contentful's aka. 'Content delivery / preview tokens'. (Visit https://app.contentful.com/spaces/[YOUR-SPACE-ID]/api/keys)

### Example

```
resource_types:
  - name: concourse-contentful-webhooks
    type: docker-image
    source:
      repository: comicrelief/concourse-contentful-webhook

resources:
  - name: contentful-hook
    type: concourse-contentful-webhooks
    webhook_token: secretabc123
    source:
      space-id: zxx111222333
      access-token: 1010ffeebbccddee00112233445566778899aabbccddeeff0011223344556677
```
