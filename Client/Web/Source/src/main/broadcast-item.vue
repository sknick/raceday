<template>
    <div class="grid-container">
        <img :src="mediaIcon()" :title="mediaTypeText()" />

        <span v-for="symbol in symbols" v-bind:key="symbol">
            <span :title="symbol.title" v-html="symbol.htmlCode"/>
        </span>

        <span>
            <span v-if="hasValidUrl()"><a :href="broadcast.url" target="_blank">{{ linkText() }}</a></span>
            <span v-else>{{ linkText() }}</span>
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
                    return require('../assets/cable.png')
                case "Facebook":
                    return require("../assets/facebook.png")
                case "F1_TV":
                    return require("../assets/f1tv.png")
                case "Motorsport_tv":
                    return require("../assets/motorsporttv.png")
                case "YouTube":
                    return require("../assets/youtube.png")
                default:
                    return require("../assets/other.png")
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
                htmlCode: "&#128178;",
                title:    "Requires Account"
            });
        } else if (this.broadcast.paid === false) {
            this.symbols.push({
                htmlCode: "&#128275;",
                title:    "Free"
            });
        } else {
            this.symbols.push({
                htmlCode: "",
                title:    ""
            });
        }

        if (this.broadcast.geoblocked === true) {
            this.symbols.push({
                htmlCode: "&#128683;",
                title:    "Geoblocked"
            });
        } else if (this.broadcast.geoblocked === false) {
            this.symbols.push({
                htmlCode: "&#128275;",
                title:    "Unrestricted"
            });
        } else {
            this.symbols.push({
                htmlCode: "",
                title:    ""
            });
        }
    }
}

</script>


<style scoped>

a {
    color: #91bfe6;
}

.grid-container {
    display: grid;
    grid-template-columns: 40px 30px 30px auto;
    align-items: center;
}

.lang-list {
    margin-left: 10px;
}

</style>
