// From https://github.com/zisuzon/v-chips-multiselect - I ouldn't get it to
work as plugin in vue3 so created my own component from the source code // I
also had to adapt and use vue3-click-away instead of v-on-click-outside
<template>
  <div v-click-away="deactivate">
    <div class="selecteditems" @click.prevent="activate()">
      <ul class="chips">
        <li
          v-for="item in modelValue"
          :key="item.id"
          class="chips__item"
          @click.stop="onRemoveItem(item)"
        >
          <template v-if="sortingProperty">
            <span>{{ item[sortingProperty] }}</span>
          </template>
          <template v-else>
            {{ item.label }}
          </template>
          <span class="chips--remove"><b>x</b></span>
        </li>

        <li class="chips__itemInput" v-if="items.length !== 0">
          <input
            v-model="searchedText"
            @focus.prevent="activate()"
            @keyup.esc="deactivate()"
            @keyup.enter="enterToSelectItem()"
            class="chips__input--fake"
            type="text"
            placeholder="Search"
            ref="search"
          />
        </li>
      </ul>
    </div>

    <div v-if="showList && items.length !== 0" class="allitems">
      <ul>
        <li
          class="allitems__list"
          v-for="item in filteredAllItems"
          :key="item.id"
          @click="
            onSelectItem(item);
            deactivate();
          "
        >
          <template v-if="sortingProperty">
            <span>{{ item[sortingProperty] }}</span>
          </template>
          <template v-else>
            {{ item.label }}
          </template>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mixin as VueClickAway } from "vue3-click-away";

const sortBy = (key) => {
  return (a, b) => (a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0);
};

export default {
  mounted() {
    this.selectedItems = [];
  },
  props: {
    items: {
      type: Array,
      required: true,
    },
    modelValue: {
      type: Array,
    },
    sortingProperty: {
      type: String,
      default: null,
    },
  },
  mixins: [VueClickAway],
  data() {
    return {
      searchedText: null,
      selectedItems: null,
      showList: false,
    };
  },
  computed: {
    allItems() {
      let items = [...this.items];
      if (items.length === 0) {
        this.deactivate();
        return items;
      }
      if (!this.sortingProperty) return items.sort();
      return items.sort(sortBy(this.sortingProperty));
    },
    filteredAllItems() {
      if (this.searchedText) {
        let filteredItems = this.allItems.filter((i) => {
          if (this.sortingProperty) {
            return i[this.sortingProperty]
              .toLowerCase()
              .includes(this.searchedText.toLowerCase());
          } else {
            return i.label
              .toLowerCase()
              .includes(this.searchedText.toLowerCase());
          }
        });
        return filteredItems;
      } else {
        return this.allItems;
      }
    },
  },
  methods: {
    enterToSelectItem() {
      if (this.filteredAllItems.length === 1) {
        this.onSelectItem(this.filteredAllItems[0]);
      }
    },
    onSelectItem(item) {
      this.selectedItems.push(item);

      this.$emit("update:modelValue", this.selectedItems);

      let indexOfItem = this.allItems.findIndex((i) => {
        return i.id === item.id;
      });
      this.allItems.splice(indexOfItem, 1);
      this.searchedText = null;
    },
    onRemoveItem(item) {
      this.allItems.push(item);
      this.sortingProperty
        ? this.allItems.sort(sortBy(this.sortingProperty))
        : this.allItems.sort();

      let indexOfItem = this.selectedItems.findIndex((i) => {
        return i.id === item.id;
      });
      this.selectedItems.splice(indexOfItem, 1);
      this.$emit("update:modelValue", this.selectedItems);
    },
    activate() {
      this.showList = true;
    },
    deactivate() {
      this.showList = false;
    },
  },
};
</script>

<style lang="sass" scoped>
.chips
  background-color: #ffffff
  border: 1px solid #dbdbdb
  border-radius: 4px
  color: #363636
  padding-bottom: calc(0.375em - 1px)
  padding-left: calc(0.625em - 1px)
  padding-right: calc(0.625em - 1px)
  padding-top: calc(0.375em - 1px)
  cursor: pointer

  &--remove
    margin-right: 1px
    margin-left: 3px
    color: #cc0029

  &__item
    display: inline-block
    background-color: rgba(50, 115, 220, .2)
    margin: 4px
    padding: 6px
    border-radius: 6px
    transition: 0.3s

    &:hover
      background-color: rgba(50, 115, 220, .3)

  &__itemInput
    display: inline-block

  &__input--fake
    border: none
    width: 100%
    line-height: 1.42857143
    font-size: 1rem
    height: 36px

    &:focus,
    &:active
      outline: none

.allitems
  cursor: pointer
  border: 1px solid #dbdbdb
  max-height: 150px
  height: calc(100vh - 240px)
  overflow-y: scroll

  ul
    list-style: none

  &__list
    padding: 6px
    transition: 0.3s

    &:hover
      background: rgba(50, 115, 220, 1)
      color: #ffffff
</style>
