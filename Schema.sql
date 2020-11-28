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

CREATE VIEW broadcasts AS
SELECT broadcast.id AS broadcast_id,
       broadcast.type AS broadcast_type,
       broadcast.url AS broadcast_url,
       event.id AS event_id,
       event.start AS event_start
  FROM broadcast
  JOIN event
    ON broadcast.event_id = event.id;

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

CREATE FUNCTION add_test_data() RETURNS int
AS $$
DECLARE
    location_circuit_de_barcelona_catalunya uuid;
    location_circuit_paul_ricard uuid;
    series_2020_clio_cup uuid;
    series_gtwc_europe_2020 uuid;
    event_2020_clio_cup_circuit_de_barcelona_catalyuna_race1 uuid;
    event_2020_clio_cup_circuit_de_barcelona_catalyuna_race2 uuid;
    event_2020_clio_cup_circuit_paul_ricard_race1 uuid;
    event_2020_clio_cup_circuit_paul_ricard_race2 uuid;
    event_gwtc_europe_2020_circuit_paul_ricard_main_race uuid;
    event_2020_formula_drift_round5 uuid;
BEGIN
    SELECT uuid_generate_v4() INTO location_circuit_de_barcelona_catalunya;
    SELECT uuid_generate_v4() INTO location_circuit_paul_ricard;

    INSERT INTO location VALUES (location_circuit_de_barcelona_catalunya, 'Circuit de Barcelona-Catalunya');
    INSERT INTO location VALUES (location_circuit_paul_ricard, 'Circuit Paul Ricard');

    SELECT uuid_generate_v4() INTO series_2020_clio_cup;
    SELECT uuid_generate_v4() INTO series_gtwc_europe_2020;

    INSERT INTO series VALUES (series_2020_clio_cup, '2020 Clio Cup');
    INSERT INTO series VALUES (series_gtwc_europe_2020, 'GTWC Europe 2020');

    SELECT uuid_generate_v4() INTO event_2020_clio_cup_circuit_de_barcelona_catalyuna_race1;
    SELECT uuid_generate_v4() INTO event_2020_clio_cup_circuit_de_barcelona_catalyuna_race2;
    SELECT uuid_generate_v4() INTO event_2020_clio_cup_circuit_paul_ricard_race1;
    SELECT uuid_generate_v4() INTO event_2020_clio_cup_circuit_paul_ricard_race2;
    SELECT uuid_generate_v4() INTO event_gwtc_europe_2020_circuit_paul_ricard_main_race;
    SELECT uuid_generate_v4() INTO event_2020_formula_drift_round5;

    INSERT INTO event VALUES (event_2020_clio_cup_circuit_de_barcelona_catalyuna_race1, 'Race 1', '11-14-2020 16:00:00 +1', NULL, location_circuit_de_barcelona_catalunya, series_2020_clio_cup);
    INSERT INTO event VALUES (event_2020_clio_cup_circuit_de_barcelona_catalyuna_race2, 'Race 2', '11-15-2020 16:00:00 +1', NULL, location_circuit_de_barcelona_catalunya, series_2020_clio_cup);
    INSERT INTO event VALUES (event_2020_clio_cup_circuit_paul_ricard_race1, 'Race 1', '11-21-2020 16:30:00 +1', NULL, location_circuit_paul_ricard, series_2020_clio_cup);
    INSERT INTO event VALUES (event_2020_clio_cup_circuit_paul_ricard_race2, 'Race 2', '11-22-2020 16:30:00 +1', NULL, location_circuit_paul_ricard, series_2020_clio_cup);
    INSERT INTO event VALUES (event_gwtc_europe_2020_circuit_paul_ricard_main_race, 'Main Race', '11-15-2020 10:30:00 +1', NULL, location_circuit_paul_ricard, series_gtwc_europe_2020);
    INSERT INTO event VALUES (event_2020_formula_drift_round5, '2020 Formula Drift - Round 5', '10-31-2020 14:30:00 -6', NULL, NULL, NULL);

    INSERT INTO broadcast VALUES (uuid_generate_v4(), 'YouTube', event_2020_clio_cup_circuit_de_barcelona_catalyuna_race1, 'https://www.youtube.com/watch?v=liIKAAXsJAk');
    INSERT INTO broadcast VALUES (uuid_generate_v4(), 'YouTube', event_2020_clio_cup_circuit_de_barcelona_catalyuna_race2, 'https://www.youtube.com/watch?v=3jE81xlebNs');
    INSERT INTO broadcast VALUES (uuid_generate_v4(), 'YouTube', event_2020_clio_cup_circuit_paul_ricard_race1, 'https://www.youtube.com/watch?v=DsDgOVi6ZQE');
    INSERT INTO broadcast VALUES (uuid_generate_v4(), 'YouTube', event_2020_clio_cup_circuit_paul_ricard_race2, 'https://www.youtube.com/watch?v=HJCOpyAI1TA');
    INSERT INTO broadcast VALUES (uuid_generate_v4(), 'YouTube', event_gwtc_europe_2020_circuit_paul_ricard_main_race, 'https://www.youtube.com/watch?v=yuV2quOZVB4');
    INSERT INTO broadcast VALUES (uuid_generate_v4(), 'YouTube', event_2020_formula_drift_round5, 'https://www.youtube.com/watch?v=kj6Azm-MBOs');

    RETURN 0;
END;
$$ LANGUAGE plpgsql;

SELECT add_test_data();

DROP EXTENSION "uuid-ossp";

\c postgres
