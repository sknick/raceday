<template>
    <div>
        <Header/>

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
                        <td>{{ timestampToString(event.start) }}</td>
                        <td>{{ event.series ? event.series.name : "" }}</td>
                        <td>{{ event.name }}</td>
                        <td>{{ event.location ? event.location.name : "" }}</td>
                    </tr>

                    <div v-if="shownEvents.includes(event.id)">
                        <div v-if="event.broadcasts && (event.broadcasts.length > 0)">
                            <tr v-for="broadcast in event.broadcasts" v-bind:key="broadcast">
                                <td colspan="4" v-if="broadcast.url"><img :src="mediaIcon(broadcast)" alt="Media icon"> <a :href="broadcast.url" target="_blank" v-if="broadcast.url.match('^https?://')">{{ broadcast.url }}</a><span v-else>{{ broadcast.url }}</span></td>
                                <td colspan="4" v-else><img :src="mediaIcon(broadcast)" alt="Media icon"> {{ broadcast.type_ }}</td>
                            </tr>
                        </div>
                        <div v-else>
                            <tr>
                                <td colspan="4">(No Broadcasts)</td>
                            </tr>
                        </div>
                    </div>
                </tbody>
            </table>
        </div>
    </div>
</template>


<script>

import Header from "./header.vue"

import axios from "axios"


export default {

    name: "EventListByDay",

    components: {
        Header
    },

    computed: {
        events() {
            return this.$store.state.events
        }
    },

    data() {
        return {
            shownEvents: []
        };
    },

    methods: {
        mediaIcon(broadcast) {
            switch (broadcast.type_) {
                case "Facebook":
                    return require("../assets/facebook.png")
                case "YouTube":
                    return require("../assets/youtube.png")
                default:
                    return require("../assets/other.png")
            }
        },

        timestampToString(timestamp) {
            return new Date(timestamp * 1000).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit", timeZoneName: "short"})
        },

        toggleEvent(eventId) {
            const self = this

            axios.get(
                "api/broadcasts?event_id=" + eventId
            ).then(
                function (response) {
                    for (let i = 0; i < self.events.length; i++) {
                        if (self.events[i].id === eventId) {
                            self.events[i].broadcasts = []
                            for (let j = 0; j < response.data.length; j++) {
                                self.events[i].broadcasts.push(response.data[j])
                            }

                            break
                        }
                    }

                    const index = self.shownEvents.indexOf(eventId)
                    if (index > -1) {
                        self.shownEvents.splice(index, 1)
                    } else {
                        self.shownEvents.push(eventId)
                    }
                }
            );
        }
    },

    mounted() {
        this.$store.dispatch("updateEvents")
    }
}

</script>
