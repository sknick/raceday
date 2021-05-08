<template>
    <div class="grid-container">
        <img :src="mediaIcon()" :title="broadcast.type_" />

        <span v-for="symbol in symbols" v-bind:key="symbol">
            <span :title="symbol.title" v-html="symbol.htmlCode"/>
        </span>

        <span v-if="hasValidUrl()"><a :href="broadcast.url" target="_blank">{{ linkText() }}</a></span>
        <span v-else>{{ linkText() }}</span>
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

        linkText() {
            if (this.broadcast.description) {
                return this.broadcast.description;
            } else {
                return this.broadcast.url;
            }
        },

        mediaIcon() {
            switch (this.broadcast.type_) {
                case "Facebook":
                    return require("../assets/facebook.png")
                case "YouTube":
                    return require("../assets/youtube.png")
                default:
                    return require("../assets/other.png")
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

</style>
