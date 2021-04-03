<template>
    <div class="header-container">
        <div class="page-header">
            <Header/>
            <table class="table event-table-headers">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Series</th>
                        <th>Event</th>
                        <th>Location</th>
                    </tr>
                </thead>
            </table>
        </div>

        <div>
            <table class="table table-hover event-table">
                <tbody v-for="event in events" v-bind:key="event">
                    <tr v-if="!isPast(event.start)" @click="toggleEvent(event.id)">
                        <td>{{ timestampToString(event.start) }}</td>
                        <td>{{ event.series ? event.series.name : "" }}</td>
                        <td>{{ event.name }}</td>
                        <td>{{ event.location ? event.location.name : "" }}</td>
                    </tr>
                    <tr v-else class="text-muted" @click="toggleEvent(event.id)">
                        <td>{{ timestampToString(event.start) }}</td>
                        <td>{{ event.series ? event.series.name : "" }}</td>
                        <td>{{ event.name }}</td>
                        <td>{{ event.location ? event.location.name : "" }}</td>
                    </tr>

                    <template v-if="shownEvents.includes(event.id)">
                        <template v-if="event.broadcasts && (event.broadcasts.length > 0)">
                            <tr v-for="broadcast in event.broadcasts" v-bind:key="broadcast">
                                <td colspan="4" v-if="broadcast.url"><img :src="mediaIcon(broadcast)" alt="Media icon"> <a :href="broadcast.url" target="_blank" v-if="broadcast.url.match('^https?://')">{{ broadcast.url }}</a><span v-else>{{ broadcast.url }}</span></td>
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
            loadTime: null,
            shownEvents: []
        };
    },

    methods: {
        isPast(start) {
            return (Math.round(this.loadTime.getTime() / 1000) > start)
        },

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
                            const broadcasts = []
                            for (let j = 0; j < response.data.length; j++) {
                                broadcasts.push(response.data[j])
                            }

                            broadcasts.sort(
                                function(a, b) {
                                    if (a.url < b.url) {
                                        return -1
                                    } else if (a.url > b.url) {
                                        return 1
                                    } else {
                                        return 0
                                    }
                                }
                            )

                            self.events[i].broadcasts = broadcasts

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

    created() {
        this.$store.watch(
            () => {
                return this.$store.state.date
            },
            () => {
                this.shownEvents = []
            }
        )
    },

    mounted() {
        this.loadTime = new Date();
        this.$store.dispatch("updateDate")
    }
}

</script>


<style scoped>

.event-table {
    cursor: default
}

.event-table-headers {
    margin-bottom: 0;
}

.header-container {
    position: relative;
}
.page-header {
    position: sticky;
    top: 0;
    background-color: #272b30; /* TODO: Matches bootstrap, need to find out how to properly override this */
}


</style>
