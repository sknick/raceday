<template>
    <div>
        <div>
            <span class="upper-left-info">
                Date (GMT): <DatepickerLite class="datepicker" :value-attr="today" @value-changed="onDateSelected"></DatepickerLite>
                <span style="padding-left: 10px">{{ events ? events.length : 0 }} event{{ events && events.length === 1 ? "" : "s" }}{{ events && events.length > 0 ? " (Click on " + (events.length !== 1 ? "an" : "the") + " event to see available broadcasts)" : "" }}</span>
            </span>
            <span class="logo">
                Race Day <img src="favicon.ico" height="24" width="24" alt="Race Day icon">
            </span>
        </div>

        <div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Series</th>
                        <th>Event</th>
                        <th>Location</th>
                    </tr>
                </thead>

                <tbody v-for="event in events" v-bind:key="event">
                    <tr class="event" @click="toggleEvent(event.id)">
                        <td>{{ timestampToString(event.start) }}<span v-html="dateIfNeeded(event.start)"/></td>
                        <td>{{ event.series ? event.series.name : "" }}</td>
                        <td>{{ event.name }}</td>
                        <td>{{ event.location ? event.location.name : "" }}</td>
                    </tr>

                    <template v-if="shownEvents.includes(event.id)">
                        <template v-if="event.broadcasts && (event.broadcasts.length > 0)">
                            <tr v-for="broadcast in event.broadcasts" v-bind:key="broadcast">
                                <td colspan="4" v-if="broadcast.url"><img :src="mediaIcon(broadcast)" alt="Media icon"> <a :href="broadcast.url" target="_blank">{{ broadcast.url }}</a></td>
                                <td colspan="4" v-else><img :src="mediaIcon(broadcast)" alt="Media icon"> {{ broadcast.type_ }}</td>
                            </tr>
                        </template>
                        <template v-else>
                            <tr>
                                <td colspan="4">(No Broadcasts)</td>
                            </tr>
                        </template>
                    </template>
                </tbody>
            </table>
        </div>
    </div>
</template>


<script>

import axios from "axios";
import DatepickerLite from "vue3-datepicker-lite";

export default {

    name: "Root",

    components: {
        DatepickerLite
    },

    computed: {
        today: function() {
            let d = new Date();
            return d.getFullYear() + "/" +
                String(d.getMonth() + 1).padStart(2, "0") + "/" +
                String(d.getDate()).padStart(2, "0");
        }
    },

    data: function() {
        return {
            events:      null,
            shownEvents: []
        };
    },

    methods: {
        dateIfNeeded: function(timestamp) {
            let ret = "";
            let d = new Date(timestamp * 1000);

            if (d.getDate() != d.getUTCDate()) {
                ret = " (<span style=\"color: #ff0000; font-weight: bold\">" + d.toLocaleDateString(undefined, {day: "2-digit", month: "2-digit", year: "2-digit"}) + "</span>)";
            }

            return ret;
        },

        getEvents: function(dateStr) {
            let d = new Date();
            d.setHours(12);
            d.setMinutes(0);
            d.setSeconds(0);
            d.setMilliseconds(0);
            
            if (dateStr) {
                let s = dateStr.split("/");
                d.setFullYear(parseInt(s[0]));
                d.setMonth(parseInt(s[1]) - 1);
                d.setDate(parseInt(s[2]));
            }

            let self = this;
            axios.get(
                "api/events?window_start=" + Math.round(d.getTime() / 1000)
            ).then(
                function(response) {
                    self.events = response.data;
                    self.shownEvents = [];
                }
            );
        },

        mediaIcon: function(broadcast) {
            switch (broadcast.type_) {
                case "Facebook":
                    return require("../assets/facebook.png");
                case "YouTube":
                    return require("../assets/youtube.png");
                default:
                    return require("../assets/other.png");
            }
        },

        timestampToString: function(timestamp) {
            return new Date(timestamp * 1000).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit", timeZoneName: "short"});
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
        },

        onDateSelected: function(value) {
            this.getEvents(value);
        }
    },

    mounted: function() {
        this.getEvents();
    }
}

</script>


<style scoped>

.datepicker {
    display: inline;
}

.event {
    cursor: pointer;
}

.logo {
    float:         right;
    font-weight:   bold;
    padding-right: 10px;
    padding-top:   2px;
}

.upper-left-info {
    padding-left: 5px;
}

</style>
