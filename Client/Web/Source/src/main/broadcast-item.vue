<template>
    <div class="grid-container">
        <img :src="mediaIcon()" :title="mediaTypeText()" />

        <span v-for="symbol in symbols" v-bind:key="symbol" class="symbol">
            <img v-if="symbol.icon != ''" :src="symbol.icon" :title="symbol.text"/>
            <span v-else/>
        </span>

        <span>
            <span v-if="hasValidUrl()" class="broadcast-text"><a :href="broadcast.url" target="_blank">{{ linkText() }}</a></span>
            <span v-else class="broadcast-text">{{ linkText() }}</span>

            <span v-for="lang in langs()" v-bind:key="lang" class="lang-list">
                <span :title="lang.id" v-html="lang.html_code"/>
            </span>
        </span>
    </div>
</template>


<script>

export default {
    name: "BroadcastItem",

    props: {
        broadcast: Object
    },

    data() {
        return {
            symbols: []
        }
    },

    methods: {
        hasValidUrl() {
            return this.broadcast.url && this.broadcast.url.match('^https?://');
        },

        langs() {
            const ret = []

            for (let i = 0; i < this.broadcast.lang_ids.length; i++) {
                for (let j = 0; j < this.$store.state.langs.length; j++) {
                    if (this.broadcast.lang_ids[i] === this.$store.state.langs[j].id) {
                        ret.push(this.$store.state.langs[j])
                    }
                }
            }

            return ret
        },

        linkText() {
            if (this.broadcast.description) {
                return this.broadcast.description;
            } else {
                return this.broadcast.url;
            }
        },

        mediaIcon() {
            switch (this.broadcast.type_) {
                case "Cable":
                    return require("../assets/media/cable.png")
                case "Facebook":
                    return require("../assets/media/facebook.png")
                case "F1_TV":
                    return require("../assets/media/f1tv.png")
                case "Motorsport_tv":
                    return require("../assets/media/motorsporttv.png")
                case "YouTube":
                    return require("../assets/media/youtube.png")
                default:
                    return require("../assets/media/other.png")
            }
        },

        mediaTypeText() {
            switch (this.broadcast.type_) {
                case "F1_TV":
                    return "F1 TV"
                case "Motorsport_tv":
                    return "Motorsport.tv"
                default:
                    return this.broadcast.type_
            }
        }
    },

    mounted() {
        if (this.broadcast.paid === true) {
            this.symbols.push({
                icon: require("../assets/icons/dollar.svg"),
                text: "Requires Account"
            })
        } else if (this.broadcast.paid === false) {
            this.symbols.push({
                icon: require("../assets/icons/unlock-fill.svg"),
                text: "Free"
            })
        } else {
            this.symbols.push({
                icon: "",
                text: ""
            })
        }

        if (this.broadcast.geoblocked === true) {
            this.symbols.push({
                icon: require("../assets/icons/geo-fill.svg"),
                text: "Geoblocked"
            })
        } else if (this.broadcast.geoblocked === false) {
            this.symbols.push({
                icon: require("../assets/icons/globe2.svg"),
                text: "Not Geoblocked"
            })
        } else {
            this.symbols.push({
                icon: "",
                text: ""
            })
        }
    }
}

</script>


<style scoped>

a {
    color: #91bfe6;
}

.broadcast-text {
    margin-left: 16px;
}

.grid-container {
    display: grid;
    grid-template-columns: 46px 26px 26px auto;
    align-items: center;
}

.lang-list {
    margin-left: 10px;
}

.symbol {
    align: "center"
}

</style>
