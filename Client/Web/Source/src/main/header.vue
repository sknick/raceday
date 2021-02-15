<template>
    <div>
        <span class="upper-left-info">
            Date: <DatepickerLite class="datepicker" :value-attr="today" @value-changed="onDateSelected"></DatepickerLite>
            <span style="padding-left: 10px">{{ events ? events.length : 0 }} event{{ events && events.length === 1 ? "" : "s" }}{{ events && events.length > 0 ? " (Click on " + (events.length !== 1 ? "an" : "the") + " event to see available broadcasts)" : "" }}</span>
        </span>

        <span class="logo">
            Race Day <img src="favicon.ico" height="24" width="24" alt="Race Day icon"> (<a href="https://github.com/sknick/raceday" target="_blank">About</a>)
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
