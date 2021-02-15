import axios from "axios"
import { createStore } from "vuex"


export default createStore({
    state: {
        events: []
    },

    getters: {

    },

    mutations: {
        updateEvents(state, events) {
            state.events = events
        }
    },

    actions: {
        updateEvents(context, dateStr) {
            const d = new Date()
            d.setHours(12)
            d.setMinutes(0)
            d.setSeconds(0)
            d.setMilliseconds(0)
            
            if (dateStr) {
                let s = dateStr.split("/")
                d.setFullYear(parseInt(s[0]))
                d.setMonth(parseInt(s[1]) - 1)
                d.setDate(parseInt(s[2]))
            }

            axios.get(
                "api/events?" +
                "window_start=" + Math.round(d.getTime() / 1000) +
                "&time_zone=" + Intl.DateTimeFormat().resolvedOptions().timeZone
            ).then(
                function(response) {
                    context.commit("updateEvents", response.data)
                }
            );
        }
    }
})
