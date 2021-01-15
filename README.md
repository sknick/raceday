# Race Day

Race Day is fundamentally a database of motorsports racing events and is the
software that powers http://raceday.watch. The backend uses a PostreSQL database
for storage, and a REST API documented via an OpenAPI specification provides
access to the data over HTTP (see `api.yaml`).

The web application provides a read-only user interface of motorsports racing
events and any associated broadcasts. A separate user interface allows site
owners to add and edit race events.
