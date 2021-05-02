<template>
    <div className="app-wrapper">
        <router-view></router-view>
    </div>
</template>


<script>

export default {
    name: "App"
}

</script>

<style>

:root {
    --dp-border-radius: 6px;
    --dp-border-radius-md: 4px;
    --dp-child-border-sm: 4px;
    --dp-select-border-radius: 4px;
    --button-background: var(--dark);
    --button-background-hover: var(--primary);
    --button-text-color: var(--light);
    --button-text-color-hover: var(--secondary);
    --button-shadow: 0 3px 6px rgba(0, 0, 0, 0.9);
}

.app-wrapper {
    height: 100vh;
    width: 100vw;
    overflow: hidden;
}

@import "css/datepicker.css";

</style>
