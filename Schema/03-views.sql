CREATE VIEW events AS
SELECT event.id                     AS event_id,
       event.name                   AS event_name,
       event.start                  AS event_start,
       event.description            AS event_description,
       location.id                  AS location_id,
       location.name                AS location_name,
       location.description         AS location_description,
       series.id                    AS series_id,
       series.name                  AS series_name,
       series.description           AS series_description
  FROM event
  LEFT JOIN location
    ON event.location_id = location.id
  LEFT JOIN series
    ON event.series_id = series.id;

CREATE VIEW broadcasts AS
SELECT broadcast.id                 AS broadcast_id,
       broadcast.type               AS broadcast_type,
       broadcast.description        AS broadcast_description,
       broadcast.url                AS broadcast_url,
       broadcast.lang_ids           AS broadcast_lang_ids,
       broadcast.geoblocked         AS broadcast_geoblocked,
       broadcast.paid               AS broadcast_paid,
       events.event_id              AS event_id,
       events.event_name            AS event_name,
       events.event_start           AS event_start,
       events.event_description     AS event_description,
       events.location_id           AS location_id,
       events.location_name         AS location_name,
       events.location_description  AS location_description,
       events.series_id             AS series_id,
       events.series_name           AS series_name,
       events.series_description    AS series_description
  FROM broadcast
  JOIN events
    ON broadcast.event_id = events.event_id;
