<template>
    <div>
        <span class="upper-left-info">
            Date: <DatepickerLite class="datepicker" :value-attr="today" @value-changed="onDateSelected"></DatepickerLite>
            <span style="padding-left: 10px">{{ events ? events.length : 0 }} event{{ events && events.length === 1 ? "" : "s" }}{{ events && events.length > 0 ? " (Click on " + (events.length !== 1 ? "an" : "the") + " event to see available broadcasts)" : "" }}</span>
        </span>

        <span class="logo">
            Race Day <img src="favicon.ico" height="24" width="24" alt="Race Day icon"> (<a href="#" @click="onExport">Export</a> | <a href="https://github.com/sknick/raceday" target="_blank">About</a>)
        </span>
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
        }
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
