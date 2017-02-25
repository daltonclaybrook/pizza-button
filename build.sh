#!/bin/bash

docker stop pizza-button
docker rm pizza-button
docker rmi pizza-button

docker build --no-cache -t pizza-button .
docker create --name pizza-button pizza-button
docker start pizza-button

docker cp pizza-button:/app/archive.zip ~/Desktop/pizza/pizza.zip
