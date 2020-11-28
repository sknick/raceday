#!/usr/bin/env python3

import argparse
import datetime

import raceday
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

DATE_FORMAT = "%m/%d/%Y"


def main(args):
    config = raceday.Configuration()
    config.host = args.host
    config.verify_ssl = False

    api = raceday.DefaultApi(raceday.ApiClient(config))

    window_start = datetime.datetime.strptime(args.window_start, DATE_FORMAT).timestamp()

    if not args.window_end:
        events = api.events_get(window_start=window_start)
    else:
        window_end = datetime.datetime.strptime(args.window_end, DATE_FORMAT).timestamp()
        events = api.events_get(window_start=window_start, window_end=window_end)

    print(events)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("window_start")
    parser.add_argument("--window_end")
    parser.add_argument("--host", default="http://localhost:8080")

    main(parser.parse_args())
