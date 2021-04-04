<template>
    <div class="header-container">

        <div class="page-header">
            <Header/>

            <div class="row event-table-headers">
                <div class="col-2">Time</div>
                <div class="col-4">Series</div>
                <div class="col-3">Event</div>
                <div class="col-3">Location</div>
            </div>
        </div>

        <div>

            <div class="event-table">
                <div v-for="event in events" v-bind:key="event">
                    <div :class="{'text-muted': isPast(event.start)}" @click="toggleEvent(event.id)" class="row">
                        <div class="col-2">{{ timestampToString(event.start) }}</div>
                        <div class="col-4">{{ event.series ? event.series.name : "" }}</div>
                        <div class="col-3">{{ event.name }}</div>
                        <div class="col-3">{{ event.location ? event.location.name : "" }}</div>
                    </div>

                    <template v-if="shownEvents.includes(event.id)">
                        <template v-if="event.broadcasts && (event.broadcasts.length > 0)">
                            <div v-for="broadcast in event.broadcasts" v-bind:key="broadcast" class="row">
                                <div class="col-12" v-if="broadcast.url"><img :src="mediaIcon(broadcast)" alt="Media icon" /> <a :href="broadcast.url" target="_blank" v-if="broadcast.url.match('^https?://')">{{ broadcast.url }}</a><span v-else>{{ broadcast.url }}</span></div>
                                <div class="col-12" v-else><img :src="mediaIcon(broadcast)" alt="Media icon" /> {{ broadcast.type_ }}</div>
                            </div>
                        </template>
                        <template v-else>
                            <div class="row">
                                <div class="col-12">(No Broadcasts)</div>
                            </div>
                        </template>
                    </template>
                </div>

            </div>

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
    border-top: 2px solid rgba(0,0,0,0.6);
    font-weight: bold;
    color: #fff;
}

.header-container {
    height: 100%;
    width: 100%;
    overflow: hidden auto;
    position: relative;
}

.page-header {
    position: sticky;
    top: 0;
    background-color: #272b30;
    width: 100%;
    z-index: 2;
}

.row {
    border-bottom: 2px solid rgba(0,0,0,0.6);
    color: #fff;
    padding: 0.75em;
}

.row:hover:not(.event-table-headers) {
    background-color: rgba(255,255,255,0.05);
}

</style>
