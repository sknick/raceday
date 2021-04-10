CREATE FUNCTION log_event_added() RETURNS trigger AS $$
    BEGIN
        INSERT INTO audit_log VALUES (
            uuid_generate_v4(),
            NEW.who_created,
            CURRENT_TIMESTAMP,
            'event',
            NEW.name,
            'added'
        );

        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION log_event_deleted() RETURNS trigger AS $$
    BEGIN
        INSERT INTO audit_log VALUES (
            uuid_generate_v4(),
            NULL,
            CURRENT_TIMESTAMP,
            'event',
            OLD.name,
            'deleted'
        );

        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION log_event_updated() RETURNS trigger AS $$
    BEGIN
        INSERT INTO audit_log VALUES (
            uuid_generate_v4(),
            NEW.who_last_modified,
            CURRENT_TIMESTAMP,
            'event',
            NEW.name,
            'updated'
        );

        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;
