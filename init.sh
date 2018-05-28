#!/usr/bin/env bash
# Source: https://concoursetutorial.com/

OS="`uname`"
case $OS in
  'Linux')
    OS='Linux'
    alias ls='ls --color=auto'
    ;;
  'FreeBSD')
    OS='FreeBSD'
    alias ls='ls -G'
    ;;
  'WindowsNT')
    OS='Windows'
    ;;
  'Darwin')
    OS='Mac'
    ;;
  'SunOS')
    OS='Solaris'
    ;;
  'AIX') ;;
  *) ;;
esac

case $OS in
  'Mac')
    mkdir docker-client
    cd docker-client
    # wget -bqc https://download.docker.com/mac/stable/Docker.dmg
    wget https://download.docker.com/mac/stable/Docker.dmg
    echo "INSTALL DOCKER DMG (OSX) $(pwd)/docker-client/Docker.dmg"
    cd -
  ;;
  *)
    echo "INSTALL DOCKER AND PLEASE UPDATE INIT.SH"
  ;;
esac

mkdir docker-concourse
cd docker-concourse
wget https://concourse-ci.org/docker-compose.yml
docker-compose up -d
open http://127.0.0.1:8080
cd -

case $OS in
  'Mac')
    mkdir fly-cli-client
    cd fly-cli-client
    wget https://github.com/concourse/concourse/releases/download/v3.13.0/fly_darwin_amd64
    mv fly_darwin_amd64 fly
    sudo chmod +x fly
    install fly /usr/local/bin
    cd -
  ;;
  *)
    echo "INSTALL FLY AND PLEASE UPDATE INIT.SH"
  ;;
esac

fly -t tutorial login --concourse-url http://127.0.0.1:8080
fly -t tutorial sync
fly -t tutorial set-pipeline -c examples/init/pipeline.yml -p hello-world
fly -t tutorial unpause-pipeline -p hello-world

sudo rm -rf docker-client
sudo rm -rf fly-cli-client

echo "If you wish to stop the quick start pipeline run"
echo "'cd docker-concourse; docker-compose down; cd -'"
