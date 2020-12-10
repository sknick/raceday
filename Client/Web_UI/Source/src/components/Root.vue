<template>
    <div>
        <table class="table">
            <thead>
            <tr>
                <th>Series</th>
                <th>Event</th>
                <th>Time</th>
            </tr>
            </thead>

            <tbody>
            <template v-for="event in events" v-bind:key="event">
                <tr class="event" @click="toggleEvent(event.id)">
                    <td>{{ event.series.name }}</td>
                    <td>{{ event.name }}</td>
                    <td>{{ timestampToString(event.start) }}</td>
                </tr>

                <template v-if="shownEvents.includes(event.id)">
                    <template v-if="event.broadcasts.length > 0">
                        <tr v-for="broadcast in event.broadcasts" v-bind:key="broadcast">
                            <td colspan="3"><a :href="broadcast.url" target="_blank">{{ broadcast.url }}</a></td>
                        </tr>
                    </template>
                    <template v-else>
                        <tr>
                            <td colspan="3">(No Streams)</td>
                        </tr>
                    </template>
                </template>
            </template>
            </tbody>
        </table>
    </div>
</template>


<script>

import axios from "axios";

export default {

    name: "Root",

    data: function() {
        return {
            events: null,
            shownEvents: []
        };
    },

    mounted: function() {
        axios.get(
            "api/events?window_start=" + (new Date(2020, 10, 15).getTime() / 1000)
        ).then(
            response => (this.events = response.data)
        );
    },

    methods: {
        timestampToString: function(timestamp) {
            let d = new Date(timestamp * 1000);
            let timezoneOffset = d.getTimezoneOffset() / 60;
            let timezoneOffsetStr = "";
            if (timezoneOffset < 0) {
                timezoneOffsetStr = "GMT-" + String(timezoneOffset).padStart(2, "0") + "00";
            } else {
                timezoneOffsetStr = "GMT+" + String(timezoneOffset).padStart(2, "0") + "00";
            }

            return String(d.getHours()).padStart(2, "0") + ":" +
                String(d.getMinutes()).padStart(2, "0") + " " +
                timezoneOffsetStr;
        },

        toggleEvent: function(eventId) {
            const self = this;

            axios.get(
                "api/broadcasts?event_id=" + eventId
            ).then(
                function (response) {
                    for (let i = 0; i < self.events.length; i++) {
                        if (self.events[i].id === eventId) {
                            self.events[i].broadcasts = [];
                            for (let j = 0; j < response.data.length; j++) {
                                self.events[i].broadcasts.push(response.data[j]);
                            }

                            break;
                        }
                    }

                    const index = self.shownEvents.indexOf(eventId);
                    if (index > -1) {
                        self.shownEvents.splice(index, 1);
                    } else {
                        self.shownEvents.push(eventId);
                    }
                }
            );
        }
    }
}

</script>


<style scoped>

.event {
    cursor: pointer;
}

</style>
