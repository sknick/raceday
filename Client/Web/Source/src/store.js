import axios from "axios"
import { createStore } from "vuex"


export default createStore({
    state: {
        date: null,
        events: [],
        langs: []
    },

    getters: {

    },

    mutations: {
        updateDate(state, date) {
            state.date = date
        },

        updateEvents(state, events) {
            state.events = events
        },

        updateLangs(state, langs) {
            state.langs = langs
        }
    },

    actions: {
        updateDate(context, date) {
            context.commit("updateDate", date)

            let d = new Date()
            
            if (context.state.date) {
                let s = context.state.date.split("/")
                d = new Date(parseInt(s[0]), parseInt(s[1]) - 1, parseInt(s[2]))
            }

            d.setHours(12)
            d.setMinutes(0)
            d.setSeconds(0)
            d.setMilliseconds(0)

            axios.get(
                "api/events?" +
                "window_start=" + Math.round(d.getTime() / 1000) +
                "&time_zone=" + Intl.DateTimeFormat().resolvedOptions().timeZone
            ).then(
                (response) => {
                    context.commit("updateEvents", response.data)
                }
            )
        },

        updateLangs(context, langs) {
            context.commit("updateLangs", langs)
        }
    }
})
