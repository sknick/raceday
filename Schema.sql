DROP DATABASE IF EXISTS raceday;
CREATE DATABASE raceday;
\c raceday

CREATE TYPE broadcast_type AS ENUM (
    'Cable',
    'Facebook',
    'MotorTrend',
    'YouTube'
);

CREATE TABLE series (
    id                          uuid                                NOT NULL,
    name                        varchar                             NOT NULL,
    description                 varchar,

    PRIMARY KEY (id)
);

CREATE TABLE location (
    id                          uuid                                NOT NULL,
    name                        varchar                             NOT NULL,
    description                 varchar,

    PRIMARY KEY (id)
);

CREATE TABLE event (
    id                          uuid                                NOT NULL,
    name                        varchar                             NOT NULL,
    start                       timestamp                           NOT NULL,
    description                 varchar,
    location_id                 uuid,
    series_id                   uuid,

    PRIMARY KEY (id),
    FOREIGN KEY (series_id) REFERENCES series(id)
);

CREATE TABLE broadcast (
    id                          uuid                                NOT NULL,
    type                        broadcast_type                      NOT NULL,
    event_id                    uuid                                NOT NULL,
    url                         varchar,

    PRIMARY KEY (id),
    FOREIGN KEY (event_id) REFERENCES event(id)
);

CREATE TABLE system_user (
    id                          varchar                             NOT NULL,
    password_hash               varchar                             NOT NULL,
    salt                        varchar                             NOT NULL,
    first_name                  varchar,
    last_name                   varchar,
    email                       varchar,
    when_created                timestamptz                         NOT NULL,
    who_created                 varchar,
    when_updated                timestamptz,
    who_updated                 varchar,
    enabled                     boolean                             NOT NULL DEFAULT TRUE,

    PRIMARY KEY (id)
);

CREATE TABLE access_token (
    id                          uuid                                NOT NULL,
    when_created                timestamptz                         NOT NULL,
    user_id                     varchar                             NOT NULL,
    ip_address                  inet                                NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES system_user(id)
);

CREATE VIEW broadcasts AS
SELECT broadcast.id AS broadcast_id,
       broadcast.type AS broadcast_type,
       broadcast.url AS broadcast_url,
       events.event_id AS event_id,
       events.event_name AS event_name,
       events.event_start AS event_start,
       events.event_description AS event_description,
       events.location_id AS location_id,
       events.location_name AS location_name,
       events.location_description AS location_description,
       events.series_id AS series_id,
       events.series_name AS series_name,
       events.series_description AS series_description
  FROM broadcast
  JOIN events
    ON broadcast.event_id = events.event_id;

CREATE VIEW events AS
SELECT event.id AS event_id,
       event.name AS event_name,
       event.start AS event_start,
       event.description AS event_description,
       location.id AS location_id,
       location.name AS location_name,
       location.description AS location_description,
       series.id AS series_id,
       series.name AS series_name,
       series.description AS series_description
  FROM event
  LEFT JOIN location
    ON event.location_id = location.id
  LEFT JOIN series
    ON event.series_id = series.id;
