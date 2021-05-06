<template>
    <div class="main-container">

        <div class="page-header">
            <Header/>
        </div>

        <div>

            <div class="event-table" ref="eventsScroller">

                <div v-for="event in events" v-bind:key="event">
                    <div :id="event.id" class="row" :class="{'text-muted': isPast(event.start), 'offset-for-scrollbar': needsOffsetForScrollbar()}" @click="toggleEvent(event.id)">
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

                <div v-if="events.length === 0">
                    <p class="no-events">(No events for this date)</p>
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

        // The content will be pushed to the left out of alignment with the headers if there is a scrollbar.
        needsOffsetForScrollbar() {
            const ref = this.$refs.eventsScroller;
            return (this.events.length * 50) > ref.getBoundingClientRect().height;
        },

        scrollToFirstCurrentEvent() {
            const firstCurrent = this.events.find(e => {
                return !this.isPast(e.start);
            });
            if (firstCurrent) {
                const el = document.getElementById(firstCurrent.id);
                el && el.scrollIntoView(false);
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
        setTimeout(() => {
            this.scrollToFirstCurrentEvent();
        }, 500);
    }
}

</script>


<style scoped>

.event-table {
    cursor: default;
    overflow: hidden auto;
    /* Header height */
    height: calc(100vh - 100px);
    width: 100%;
}

.main-container {
    height: 100%;
    width: 100%;
    overflow: hidden;
    position: relative;
}

.no-events {
    margin: 3em;
    text-align: center;
}

.offset-for-scrollbar {
    /* Offset for scrollbar width */
    width: calc(100vw + 28px);
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
