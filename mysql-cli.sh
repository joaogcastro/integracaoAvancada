#!/bin/bash

DB_USERNAME=root
DB_PASSWORD=root
CONTAINER_NAME=mysql_container

docker exec -it $CONTAINER_NAME mysql -u $DB_USERNAME -p$DB_PASSWORD
