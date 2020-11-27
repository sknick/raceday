#!/usr/bin/env python3

import raceday
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


def main():
    config = raceday.Configuration()
    config.host = "http://localhost:8080"
    config.verify_ssl = False

    api = raceday.DefaultApi(raceday.ApiClient(config))
    broadcasts = api.broadcasts_get(event_start=1605438000)

    print(broadcasts)


if __name__ == "__main__":
    main()
