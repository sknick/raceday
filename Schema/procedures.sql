CREATE FUNCTION log_event_added() RETURNS trigger AS $$
    BEGIN
        INSERT INTO audit_log VALUES (
            uuid_generate_v4(),
            CURRENT_TIMESTAMP,
            'Added event ' || NEW.name || '.',
            NULL
        );

        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;
