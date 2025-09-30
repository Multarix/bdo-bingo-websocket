sudo docker load -i ./bingo.tar
sudo docker run -d -p 5683:5683 --env-file bingo.env --restart on-failure --name BDO-Bingo bingo-websocket