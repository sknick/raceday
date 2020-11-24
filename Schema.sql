DROP DATABASE IF EXISTS raceday;
CREATE DATABASE raceday;
\c raceday

CREATE TABLE event (
    id                          uuid                                NOT NULL,
    name                        varchar                             NOT NULL,
    description                 varchar,

    PRIMARY KEY (id)
);

CREATE TABLE stream (
    id                          uuid                                NOT NULL,
    url                         varchar                             NOT NULL,
    event_id                    uuid                                NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (event_id) REFERENCES event(id)
);


CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

INSERT INTO event VALUES (uuid_generate_v4(), '2020 Clio Cup - Circuit Paul Ricard - Race 1', '');
INSERT INTO event VALUES (uuid_generate_v4(), '2020 Clio Cup - Circuit Paul Ricard - Race 2', '');
INSERT INTO event VALUES (uuid_generate_v4(), 'GTWC Europe 2020 - 1000K Paul Ricard - Main Race', '');
INSERT INTO stream VALUES (uuid_generate_v4(), 'https://www.youtube.com/watch?v=DsDgOVi6ZQE', (SELECT id FROM event WHERE name = '2020 Clio Cup - Circuit Paul Ricard - Race 1'));
INSERT INTO stream VALUES (uuid_generate_v4(), 'https://www.youtube.com/watch?v=HJCOpyAI1TA', (SELECT id FROM event WHERE name = '2020 Clio Cup - Circuit Paul Ricard - Race 2'));
INSERT INTO stream VALUES (uuid_generate_v4(), 'https://www.youtube.com/watch?v=yuV2quOZVB4', (SELECT id FROM event WHERE name = 'GTWC Europe 2020 - 1000K Paul Ricard - Main Race'));

DROP EXTENSION "uuid-ossp";
