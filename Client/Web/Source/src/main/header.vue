<template>

    <div class="header-container">
        <div v-if="widthIsMinimal()">

            <div class="header-info-container">

                <div class="upper-left-info">

                    <div> Date:
                        <DatepickerLite
                                class="datepicker"
                                :is-button-type="datepickerSetting.isButtonType"
                                :locale="datepickerSetting.locale"
                                :value-attr="today"
                                @value-changed="onDateSelected">
                        </DatepickerLite>
                    </div>

                </div>

                <div class="logo">

                    <div>
                        Race Day <img src="favicon.ico" height="24" width="24" alt="Race Day icon">
                    </div>

                    <div class="about">
                        (<a href="#" @click="onExport">Export</a> | <a href="https://github.com/sknick/raceday" target="_blank">About</a>)
                    </div>

                </div>

            </div>

            <div class="events-label">{{ eventsLabelText() }}</div>

        </div>

        <div v-else>
            <div class="header-info-container">

                <div class="upper-left-info">

                    <div> Date:
                        <DatepickerLite
                                class="datepicker"
                                :is-button-type="datepickerSetting.isButtonType"
                                :locale="datepickerSetting.locale"
                                :value-attr="today"
                                @value-changed="onDateSelected">
                        </DatepickerLite>
                    </div>

                    <div class="events-label">{{ eventsLabelText() }}</div>

                </div>

                <div class="logo">

                    <div>
                        Race Day <img src="favicon.ico" height="24" width="24" alt="Race Day icon">
                    </div>

                    <div class="about">
                        (<a href="#" @click="onExport">Export</a> | <a href="https://github.com/sknick/raceday" target="_blank">About</a>)
                    </div>

                </div>

            </div>
        </div>

        <div class="row event-table-headers">
            <div class="col-2">Time</div>
            <div class="col-4">Series</div>
            <div class="col-3">Event</div>
            <div class="col-3">Location</div>
        </div>
    </div>

</template>


<script>

import DatepickerLite from "vue3-datepicker-lite";

export default {
    name: "Header",

    components: {
        DatepickerLite
    },

    computed: {
        events() {
            return this.$store.state.events
        },

        today() {
            let d = new Date();
            return d.getFullYear() + "/" +
                String(d.getMonth() + 1).padStart(2, "0") + "/" +
                String(d.getDate()).padStart(2, "0")
        }
    },

    methods: {
        canHover() {
            return window.matchMedia("(any-hover: hover)").matches
        },

        eventsLabelText() {
            if (!this.events || this.events.length === 0) {
                return "0 events"
            }
            const numEvents = this.events.length
            let retStr = `${numEvents} event${numEvents === 1 ? "" : "s"}`
            retStr += ` (${this.canHover() ? "Click" : "Press"}`
            retStr += ` on ${numEvents === 1 ? "the" : "an"} event to see available broadcasts)`
            return retStr
        },

        onDateSelected(value) {
            this.$store.dispatch("updateDate", value)
        },

        onExport() {
            const d = new Date()
            d.setHours(12)
            d.setMinutes(0)
            d.setSeconds(0)
            d.setMilliseconds(0)
            
            if (this.$store.state.date) {
                let s = this.$store.state.date.split("/")
                d.setFullYear(parseInt(s[0]))
                d.setMonth(parseInt(s[1]) - 1)
                d.setDate(parseInt(s[2]))
            }

            window.open(
                "api/export?" +
                "export_type=" + encodeURIComponent("Excel Spreadsheet") +
                "&window_start=" + Math.round(d.getTime() / 1000) +
                "&time_zone=" + Intl.DateTimeFormat().resolvedOptions().timeZone,

                "Export"
            )
        },

        widthIsMinimal() {
            const maxWidth = 601
            return window.outerWidth <= maxWidth
        }
    },

    setup() {
        const datepickerSetting = {
            isButtonType: true,
            locale: {
                format: "YYYY/MM/DD",
                weekday: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                startsWeeks: 1
            }
        }

        return {
            datepickerSetting
        }
    }
}

</script>


<style scoped>

.datepicker {
    display: inline;
}

.event-table-headers {
    border-top: 2px solid rgba(0,0,0,0.6);
    font-weight: bold;
    color: #fff;
}

.events-label {
    margin-left: 0.75rem;
}

.header-info-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75em;
}

.header-container {
    height: 100px;
}

.logo {
    font-weight: bold;
}

.logo, .upper-left-info {
    display: flex;
    align-items: center;
    min-width: 6.25rem;
}

.row {
    border-bottom: 2px solid rgba(0,0,0,0.6);
    color: #fff;
    padding: 0.75em;
}

@media screen and (max-width: 601px) and (orientation: portrait) {
    .about {
        font-size: smaller;
    }

    .header-info-container, .upper-left-info {
        align-items: center;
    }

    .logo {
        flex-direction: column;
    }
    .header-container {
        height: 132px;
    }
}

@media screen and (max-width: 599px) and (orientation: portrait) {
    .events-label {
        font-size: smaller;
    }
}

</style>
