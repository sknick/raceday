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
    start                       date                                NOT NULL,
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



-- Test data
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

INSERT INTO location VALUES (uuid_generate_v4(), 'Circuit de Barcelona-Catalunya');
INSERT INTO location VALUES (uuid_generate_v4(), 'Circuit Paul Ricard');

INSERT INTO series VALUES (uuid_generate_v4(), '2020 Clio Cup');
INSERT INTO series VALUES (uuid_generate_v4(), 'GTWC Europe 2020');

INSERT INTO event VALUES (uuid_generate_v4(), 'Race 1', '11/14/2020', NULL, (SELECT id FROM location WHERE name = 'Circuit de Barcelona-Catalunya'), (SELECT id FROM series WHERE name = '2020 Clio Cup'));
INSERT INTO event VALUES (uuid_generate_v4(), 'Race 2', '11/15/2020', NULL, (SELECT id FROM location WHERE name = 'Circuit de Barcelona-Catalunya'), (SELECT id FROM series WHERE name = '2020 Clio Cup'));
INSERT INTO event VALUES (uuid_generate_v4(), 'Race 1', '11/21/2020', NULL, (SELECT id FROM location WHERE name = 'Circuit Paul Ricard'), (SELECT id FROM series WHERE name = '2020 Clio Cup'));
INSERT INTO event VALUES (uuid_generate_v4(), 'Race 2', '11/22/2020', NULL, (SELECT id FROM location WHERE name = 'Circuit Paul Ricard'), (SELECT id FROM series WHERE name = '2020 Clio Cup'));
INSERT INTO event VALUES (uuid_generate_v4(), 'Main Race', '11/15/2020', NULL, (SELECT id FROM location WHERE name = 'Circuit Paul Ricard'), (SELECT id FROM series WHERE name = '2020 Clio Cup'));
INSERT INTO event VALUES (uuid_generate_v4(), '2020 Formula Drift - Round 5', '10/31/2020', NULL, NULL);

INSERT INTO broadcast VALUES (uuid_generate_v4(), 'YouTube', (SELECT id FROM event WHERE name = 'Race 1' AND start = '11/14/2020'), 'https://www.youtube.com/watch?v=liIKAAXsJAk');
INSERT INTO broadcast VALUES (uuid_generate_v4(), 'YouTube', (SELECT id FROM event WHERE name = 'Race 2' AND start = '11/15/2020'), 'https://www.youtube.com/watch?v=3jE81xlebNs');
INSERT INTO broadcast VALUES (uuid_generate_v4(), 'YouTube', (SELECT id FROM event WHERE name = 'Race 1' AND start = '11/21/2020'), 'https://www.youtube.com/watch?v=DsDgOVi6ZQE');
INSERT INTO broadcast VALUES (uuid_generate_v4(), 'YouTube', (SELECT id FROM event WHERE name = 'Race 2' AND start = '11/22/2020'), 'https://www.youtube.com/watch?v=HJCOpyAI1TA');
INSERT INTO broadcast VALUES (uuid_generate_v4(), 'YouTube', (SELECT id FROM event WHERE name = 'Main Race' AND start = '11/15/2020'), 'https://www.youtube.com/watch?v=yuV2quOZVB4');
INSERT INTO broadcast VALUES (uuid_generate_v4(), 'YouTube', (SELECT id FROM event WHERE name = '2020 Formula Drift - Round 5' AND start = '10/31/2020'), 'https://www.youtube.com/watch?v=kj6Azm-MBOs');

DROP EXTENSION "uuid-ossp";
