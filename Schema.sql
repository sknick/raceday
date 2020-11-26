DROP DATABASE IF EXISTS raceday;
CREATE DATABASE raceday;
\c raceday

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

CREATE TABLE stream (
    id                          uuid                                NOT NULL,
    url                         varchar                             NOT NULL,
    event_id                    uuid                                NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (event_id) REFERENCES event(id)
);



-- Test data
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

INSERT INTO location VALUES (uuid_generate_v4(), 'Circuit de Barcelona-Catalunya');
INSERT INTO location VALUES (uuid_generate_v4(), 'Circuit Paul Ricard');

INSERT INTO series VALUES (uuid_generate_v4(), '2020 Clio Cup');
INSERT INTO series VALUES (uuid_generate_v4(), 'GTWC Europe 2020');

INSERT INTO event VALUES (uuid_generate_v4(), 'Race 1', '11/14/2020', NULL, (SELECT id FROM location WHERE name = 'Circuit de Barcelona-Catalunya'), (SELECT id FROM series WHERE name = '2020 Clio Cup'));
INSERT INTO event VALUES (uuid_generate_v4(), 'Race 2', '11/15/2020', NULL, (SELECT id FROM location WHERE name = 'Circuit de Barcelona-Catalunya'), (SELECT id FROM series WHERE name = '2020 Clio Cup'));
INSERT INTO event VALUES (uuid_generate_v4(), 'Race 1', '11/21/2020', NULL, (SELECT id FROM location WHERE name = 'Circuit Paul Ricard'), (SELECT id FROM series WHERE name = '2020 Clio Cup'));
INSERT INTO event VALUES (uuid_generate_v4(), 'Race 2', '11/22/2020', NULL, (SELECT id FROM location WHERE name = 'Circuit Paul Ricards'), (SELECT id FROM series WHERE name = '2020 Clio Cup'));
INSERT INTO event VALUES (uuid_generate_v4(), 'Main Race', '11/15/2020', NULL, (SELECT id FROM location WHERE name = 'Circuit Paul Ricards'), (SELECT id FROM series WHERE name = '2020 Clio Cup'));

INSERT INTO stream VALUES (uuid_generate_v4(), 'https://www.youtube.com/watch?v=liIKAAXsJAk', (SELECT id FROM event WHERE name = 'Race 1' AND start = '11/14/2020'));
INSERT INTO stream VALUES (uuid_generate_v4(), 'https://www.youtube.com/watch?v=3jE81xlebNs', (SELECT id FROM event WHERE name = 'Race 2' AND start = '11/15/2020'));
INSERT INTO stream VALUES (uuid_generate_v4(), 'https://www.youtube.com/watch?v=DsDgOVi6ZQE', (SELECT id FROM event WHERE name = 'Race 1' AND start = '11/21/2020'));
INSERT INTO stream VALUES (uuid_generate_v4(), 'https://www.youtube.com/watch?v=HJCOpyAI1TA', (SELECT id FROM event WHERE name = 'Race 2' AND start = '11/22/2020'));
INSERT INTO stream VALUES (uuid_generate_v4(), 'https://www.youtube.com/watch?v=yuV2quOZVB4', (SELECT id FROM event WHERE name = 'Main Race' AND start = '11/15/2020'));

DROP EXTENSION "uuid-ossp";
