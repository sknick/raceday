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
    start                       timestamptz                         NOT NULL,
    description                 varchar,
    location_id                 uuid,
    series_id                   uuid,
    when_created                timestamptz                         NOT NULL,
    who_created                 varchar                             NOT NULL,
    when_last_modified          timestamptz                         NOT NULL,
    who_last_modified           varchar                             NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (location_id)       REFERENCES location(id),
    FOREIGN KEY (series_id)         REFERENCES series(id),
    FOREIGN KEY (who_created)       REFERENCES system_user(id),
    FOREIGN KEY (who_last_modified) REFERENCES system_user(id)
);

CREATE TABLE broadcast (
    id                          uuid                                NOT NULL,
    type                        broadcast_type                      NOT NULL,
    event_id                    uuid                                NOT NULL,
    url                         varchar,

    PRIMARY KEY (id),
    FOREIGN KEY (event_id) REFERENCES event(id)
);

CREATE TABLE access_token (
    id                          uuid                                NOT NULL,
    when_created                timestamptz                         NOT NULL,
    user_id                     varchar                             NOT NULL,
    ip_address                  inet                                NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES system_user(id)
);

CREATE TABLE audit_log (
    id                          uuid                                NOT NULL,
    user_id                     varchar,
    when_logged                 timestamptz                         NOT NULL,
    table_name                  varchar                             NOT NULL,
    item_description            varchar                             NOT NULL,
    action                      audited_action                      NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES system_user(id)
);
