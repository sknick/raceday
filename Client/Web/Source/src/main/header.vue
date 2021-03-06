<template>

    <div class="header-container">

        <div v-if="widthIsMinimal()">

            <div class="header-info-container">

                <div class="upper-left-info">

                    <div class="flex-align-center"> Date:
                        <DatepickerLite
                                class="datepicker"
                                :is-button-type="datepickerSetting.isButtonType"
                                :locale="datepickerSetting.locale"
                                :value-attr="pickerDate"
                                @value-changed="onDateSelected">
                        </DatepickerLite>

                        <button type="button" @click="onDateRegressed()" class="cycle-button cycle-button-left"></button>

                        <button type="button" @click="onDateAdvanced()" class="cycle-button cycle-button-right"></button>

                    </div>

                </div>

                <div class="upper-right-info">

                    <div class="logo">
                        <img :src="require('../assets/logo-small.png')" alt="Race Day"/>
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

                    <div class="flex-align-center"> Date:
                        <DatepickerLite
                                class="datepicker"
                                :is-button-type="datepickerSetting.isButtonType"
                                :locale="datepickerSetting.locale"
                                :value-attr="pickerDate"
                                @value-changed="onDateSelected">
                        </DatepickerLite>

                        <button type="button" @click="onDateRegressed()" class="cycle-button cycle-button-left"></button>

                        <button type="button" @click="onDateAdvanced()" class="cycle-button cycle-button-right"></button>

                    </div>

                    <div class="events-label">{{ eventsLabelText() }}</div>

                </div>

                <div class="upper-right-info">

                    <div class="logo">
                        <img :src="require('../assets/logo-small.png')" alt="Race Day"/>
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
import {
    add,
    format,
    parseISO,
    sub
} from "date-fns";

export const DATEPICKER_DATE_FORMAT = "yyyy/MM/dd";
export const URL_DATE_FORMAT = "yyyyMMdd";

export default {
    name: "Header",

    beforeMount() {
        this.setDateFromRouteQuery();
    },

    components: {
        DatepickerLite
    },

    computed: {
        selectedDate() {
            let d = this.$store.state.date ? new Date(this.$store.state.date) : new Date()
            return this.formattedDate(d);
        },

        events() {
            return this.$store.state.events
        },
    },

    data() {
        return {
            pickerDate: this.$store.state.date
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

        formattedDate(d) {
            return format(d, DATEPICKER_DATE_FORMAT);
        },

        onDateAdvanced() {
            const res = this.formattedDate(add(new Date(this.selectedDate), {days: 1}));
            this.$store.dispatch("updateDate", res);
        },

        onDateRegressed() {
            const res = this.formattedDate(sub(new Date(this.selectedDate), {days: 1}));
            this.$store.dispatch("updateDate", res);
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

        setDateFromRouteQuery() {
            let date;
            if (this.$route.query.date) {
                date = this.formattedDate(parseISO(this.$route.query.date.toString()));
            } else {
                date = this.formattedDate(new Date());
                this.setDateInRoute(new Date());
            }
            this.$store.dispatch("updateDate", date);
            this.pickerDate = date;
        },

        setDateInRoute(date) {
            this.$router.replace({
                name: this.$route.name,
                query: {
                    date: format(date, URL_DATE_FORMAT)
                }
            })
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
                format: DATEPICKER_DATE_FORMAT,
                weekday: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                startsWeeks: 1
            }
        }

        return {
            datepickerSetting
        }
    },

    watch: {
        selectedDate(newVal) {
            if (newVal) {
                this.pickerDate = newVal;
                this.setDateInRoute(new Date(newVal));
            }
        }
    },
}

</script>


<style scoped>

.flex-align-center {
    display: flex;
    align-items: center;
}

.cycle-button {
    border-radius: var(--dp-border-radius-md);
    box-shadow: var(--button-shadow);
    background: var(--button-background);
    height: 1.5em;
    width: 1.5em;
    background-size: cover;
    margin: 0;
    padding: 0; /* Resets the padding so that the svg will scale with the button size */
    padding: 0.25em;
}

.cycle-button-left {
    background-image: url("../assets/chevron-left.svg");
    margin-left: 0.5em;
}

.cycle-button-right {
    background-image: url("../assets/chevron-right.svg");
    margin-left: 0.25em;
}

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

.logo {
    margin-right: 10px;
}

.upper-right-info {
    font-weight: bold;
}

.upper-left-info, .upper-right-info {
    display: flex;
    align-items: center;
    min-width: 6.25rem;
}

.row {
    border-bottom: 2px solid rgba(0,0,0,0.6);
    color: #fff;
    padding: 0.75em;
}

@media screen and (max-width: 768px) and (orientation: portrait) {
    .about {
        font-size: smaller;
    }

    .header-info-container, .upper-left-info {
        align-items: center;
    }

    .upper-right-info {
        flex-direction: column;
    }
}

@media screen and (max-width: 599px) and (orientation: portrait) {
    .events-label {
        font-size: smaller;
    }
}

</style>
