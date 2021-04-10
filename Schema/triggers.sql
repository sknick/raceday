CREATE TRIGGER on_event_added
    AFTER INSERT ON event
    FOR EACH ROW
    EXECUTE PROCEDURE log_event_added();

CREATE TRIGGER on_event_deleted
    AFTER DELETE ON event
    FOR EACH ROW
    EXECUTE PROCEDURE log_event_deleted();

CREATE TRIGGER on_event_updated
    AFTER UPDATE ON event
    FOR EACH ROW
    EXECUTE PROCEDURE log_event_updated();
