<template>
  <div>
    <div class="top-bar">
      <div
        @click.prevent="$emit('filter')"
        v-if="numCards != 0 || filterBarVisible"
      >
        <i class="gg-filters"></i>
      </div>

      <div
        id="show-modal"
        @click.prevent="$emit('add')"
        v-if="numCards != 0 && !readOnly"
      >
        <i class="gg-add"></i>
      </div>

      <div @click.prevent="$emit('settings')">
        <i class="gg-menu-boxed"></i>
      </div>
    </div>
    <div v-if="!onLine" class="connection-status">
      No internet connection 😭
    </div>
  </div>
</template>

<script>
export default {
  emits: ["filter", "add", "settings"],
  props: {
    onLine: {
      type: Boolean,
      required: true,
    },
    numCards: {
      type: Number,
      required: true,
    },
    readOnly: {
      type: Boolean,
      required: true,
    },
    filterBarVisible: {
      type: Boolean,
      required: true,
    },
  },
};
</script>

<style scoped>
.gg-add {
  --ggs: 1.5;
  box-sizing: border-box;
  position: relative;
  display: block;
  width: 22px;
  height: 22px;
  border: 2px solid;
  transform: scale(var(--ggs, 1));
  border-radius: 22px;
  color: #df1165;
}
.gg-add::after,
.gg-add::before {
  content: "";
  display: block;
  box-sizing: border-box;
  position: absolute;
  width: 10px;
  height: 2px;
  background: currentColor;
  border-radius: 5px;
  top: 8px;
  left: 4px;
}
.gg-add::after {
  width: 2px;
  height: 10px;
  top: 4px;
  left: 8px;
}

.gg-dice-5 {
  --ggs: 1.5;
  display: block;
  transform: scale(var(--ggs, 1));
  position: relative;
  box-sizing: border-box;
  width: 22px;
  height: 22px;
  border: 2px solid;
  border-radius: 3px;
  color: #df1165;
}

.gg-dice-5::before {
  content: "";
  display: block;
  box-sizing: border-box;
  background: currentColor;
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 4px;
  left: 2px;
  top: 2px;
  box-shadow: 0 10px 0, 10px 0 0, 10px 10px 0, 5px 5px 0;
}

.gg-menu-boxed {
  --ggs: 1.8;
  box-sizing: border-box;
  position: relative;
  display: block;
  transform: scale(var(--ggs, 1));
  width: 18px;
  height: 18px;
  border-radius: 3px;
  border: 2px solid;
  color: #df1165;
}

.gg-menu-boxed::before {
  content: "";
  display: block;
  box-sizing: border-box;
  position: absolute;
  width: 10px;
  height: 2px;
  background: currentColor;
  border-radius: 3px;
  top: 2px;
  left: 2px;
  box-shadow: 0 4px 0, 0 8px 0;
}

.gg-filters {
  --ggs: 1.8;
  color: #df1165;
  display: block;
  box-sizing: border-box;
  position: relative;
  transform: scale(var(--ggs, 1));
  width: 19px;
  height: 19px;
  background: radial-gradient(circle, currentColor 26%, transparent 26%);
}

.gg-filters::after,
.gg-filters::before {
  content: "";
  display: block;
  box-sizing: border-box;
  position: absolute;
  border: 2px solid;
  border-radius: 100%;
  width: 14px;
  height: 14px;
}

.gg-filters::after {
  bottom: 0;
  right: 0;
}

.top-bar {
  display: flex;
  position: fixed;
  justify-content: space-around;
  align-items: center;
  height: 70px;
  background-color: white;
  z-index: 1000;
  top: 0;
  left: 0;
  right: 0;
  width: 100vw;
}

.connection-status {
  z-index: 100000;
  position: fixed;
  background-color: red;
  color: white;
  width: 100vw;
  font-size: 16px;
  font-weight: bold;
  top: 0;
  left: 0;
  right: 0;
}
</style>
