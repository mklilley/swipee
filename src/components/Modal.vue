<!-- prettier-ignore -->
<!-- Inspired by https://vuejs.org/v2/examples/modal.html -->
<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper" @click="$emit('close')">
        <div class="modal-container" @click.stop="">
          <!-- <div class="modal-header">
            <slot name="header">
              default header
            </slot>
          </div> -->

          <div class="modal-body">
            <slot name="body">
              default body
            </slot>
          </div>
          <span class="close" @click="$emit('close')"
            ><i class="gg-close-o"></i
          ></span>

          <!-- <div class="modal-footer">
            <slot name="footer">
              <button class="modal-default-button" @click="$emit('close')">
                OK
              </button>
            </slot>
          </div> -->
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "Modal",
  emits: ["close"],
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
  max-width: 100vw;
}

.modal-container {
  position: relative;
  width: 400px;
  max-width: 100%;
  box-sizing: border-box;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  font-family: Helvetica, Arial, sans-serif;
}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-body {
  position: relative;
  margin: 20px 0;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-default-button {
  float: right;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}

.gg-close-o {
  box-sizing: border-box;
  position: relative;
  display: block;
  transform: scale(var(--ggs, 1));
  width: 22px;
  height: 22px;
  border: 2px solid;
  border-radius: 40px;
}

.gg-close-o::after,
.gg-close-o::before {
  content: "";
  display: block;
  box-sizing: border-box;
  position: absolute;
  width: 12px;
  height: 2px;
  background: currentColor;
  transform: rotate(45deg);
  border-radius: 5px;
  top: 8px;
  left: 3px;
}

.gg-close-o::after {
  transform: rotate(-45deg);
}

.delete-card:hover,
.error {
  opacity: 1;
}
.close {
  position: absolute;
  right: 0;
  top: 0;
  padding: 15px 15px;
  opacity: 0.4;
  transition: all 0.5s ease;
}
@media (hover: hover) and (pointer: fine) {
  .close:hover {
    opacity: 1;
  }
}
</style>
