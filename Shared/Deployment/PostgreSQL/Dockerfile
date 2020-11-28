FROM postgres:10.14
ARG db_user=postgres
ARG db_password

ENV POSTGRES_USER=$db_user POSTGRES_PASSWORD=$db_password POSTGRES_DB=raceday

COPY ./Schema.sql /docker-entrypoint-initdb.d/
RUN chmod 777 /docker-entrypoint-initdb.d/Schema.sql
