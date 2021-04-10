CREATE TRIGGER on_event_added
    AFTER INSERT ON event
    FOR EACH ROW
    EXECUTE PROCEDURE log_event_added();
