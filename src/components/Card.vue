<template>
  <a
    v-if="isShowing"
    ref="interactElement"
    :class="{
      isAnimating: isInteractAnimating,
      isCurrent: isCurrent,
      dragstart: !isInteractAnimating,
      stacked: stacked,
    }"
    class="card"
    :style="{ transform: transformString }"
    :href="card.url"
    target="_blank"
    rel="noopener"
  >
    <h3 class="cardTitle">{{ card.title }}</h3>
    <img v-show="isCurrent" :src="card.image" />
    <p>{{ card.domain }}</p>
    <p>{{ card.description }}</p>
    <div
      v-if="!isInteractAnimating && swipeDirection == 'left'"
      class="overlay"
    >
      <i class="gg-trash"></i>
      <span>
        <h2>
          Discard
        </h2>
      </span>
    </div>

    <div
      v-if="!isInteractAnimating && swipeDirection == 'right'"
      class="overlay"
    >
      <i class="gg-time"></i>
      <span>
        <h2>Save for later</h2>
      </span>

      <div class="swipe-price">
        <i class="gg-dollar"></i>
        <h3>Price: {{ skipPrice }}</h3>
      </div>
    </div>
  </a>
</template>

<script>
import interact from "interactjs";
const ACCEPT_CARD = "cardAccepted";
const REJECT_CARD = "cardRejected";
const SKIP_CARD = "cardSkipped";
const HIDE_CARD = "hideCard";
const FAIL_ACCEPT_CARD = "failCardAccepted";

export default {
  static: {
    interactMaxRotation: 15,
    interactOutOfSightXCoordinate: 500,
    interactOutOfSightYCoordinate: 600,
    interactYThreshold: 150,
    interactXThreshold: 100,
  },
  emits: [HIDE_CARD, ACCEPT_CARD, REJECT_CARD, SKIP_CARD, FAIL_ACCEPT_CARD],
  props: {
    card: {
      type: Object,
      required: true,
    },
    isCurrent: {
      type: Boolean,
      required: true,
    },
    stacked: {
      type: Boolean,
      required: true,
    },
    skipPrice: {
      type: Number,
      required: true,
    },
    credits: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      isShowing: true,
      isInteractAnimating: true,
      isInteractDragged: null,
      interactPosition: {
        x: 0,
        y: 0,
        rotation: 0,
      },
      swipeDirection: "",
    };
  },

  computed: {
    transformString() {
      if (!this.isInteractAnimating || this.isInteractDragged) {
        const { x, y, rotation } = this.interactPosition;
        return `translate3D(${x}px, ${y}px, 0) rotate(${rotation}deg)`;
      }

      return null;
    },
  },

  mounted() {
    const element = this.$refs.interactElement;

    interact(element).draggable({
      listeners: {
        start: () => {
          this.isInteractAnimating = false;
        },
        move: (event) => {
          const {
            interactMaxRotation,
            interactXThreshold,
          } = this.$options.static;
          const x = this.interactPosition.x + event.dx;
          this.swipeDirection = x > 0 ? "right" : "left";
          const y = this.interactPosition.y + event.dy;

          let rotation = interactMaxRotation * (x / interactXThreshold);

          if (rotation > interactMaxRotation) rotation = interactMaxRotation;
          else if (rotation < -interactMaxRotation)
            rotation = -interactMaxRotation;

          this.interactSetPosition({ x, y, rotation });
        },
        end: () => {
          const { x, y } = this.interactPosition;
          const {
            interactXThreshold,
            interactYThreshold,
          } = this.$options.static;
          this.isInteractAnimating = true;

          if (x > interactXThreshold) {
            if (this.credits >= this.skipPrice) {
              this.playCard(ACCEPT_CARD);
            } else {
              this.resetCardPosition();
              // this Timeout is needed so that the fail event fires only when the card
              // has settles back down. Failure to have this can lead to the viewport being
              // larger than normal which allows unexpected scrolling of modal wrappers.
              // See CSS below, specifically the line starting with &.isAnimating for timing.
              let animationTimer = setTimeout(() => {
                clearTimeout(animationTimer);
                this.$emit(FAIL_ACCEPT_CARD);
              }, 500);
            }
          } else if (x < -interactXThreshold) this.playCard(REJECT_CARD);
          else if (y > interactYThreshold) {
            //this.playCard(SKIP_CARD);
          } else this.resetCardPosition();
        },
      },
    });
  },

  beforeUnmount() {
    interact(this.$refs.interactElement).unset();
  },

  methods: {
    hideCard() {
      setTimeout(() => {
        this.isShowing = false;
        this.$emit(HIDE_CARD, this.card);
      }, 300);
    },

    playCard(interaction) {
      const {
        interactOutOfSightXCoordinate,
        interactOutOfSightYCoordinate,
        interactMaxRotation,
      } = this.$options.static;

      this.interactUnsetElement();

      switch (interaction) {
        case ACCEPT_CARD:
          this.interactSetPosition({
            x: interactOutOfSightXCoordinate,
            rotation: interactMaxRotation,
          });
          this.$emit(ACCEPT_CARD);
          break;
        case REJECT_CARD:
          this.interactSetPosition({
            x: -interactOutOfSightXCoordinate,
            rotation: -interactMaxRotation,
          });
          this.$emit(REJECT_CARD);
          break;
        case SKIP_CARD:
          this.interactSetPosition({
            y: interactOutOfSightYCoordinate,
          });
          this.$emit(SKIP_CARD);
          break;
      }

      this.hideCard();
    },

    interactSetPosition(coordinates) {
      const { x = 0, y = 0, rotation = 0 } = coordinates;
      this.interactPosition = { x, y, rotation };
    },

    interactUnsetElement() {
      interact(this.$refs.interactElement).unset();
      this.isInteractDragged = true;
    },

    resetCardPosition() {
      this.interactSetPosition({ x: 0, y: 0, rotation: 0 });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../styles/index.scss";

$cardsTotal: 3;
$cardsWidth: 300px;
$cardsPositionOffset: 55vh * 0.06;
$cardsScaleOffset: 0.08;
$defaultTranslation: $cardsPositionOffset * $cardsTotal;
$defaultScale: 1 - ($cardsScaleOffset * $cardsTotal);
$fs-card-title: 1.125em;

.card {
  @include card();
  @include sizing(400px 600px);
  @include flex-center();

  @include after() {
    @include sizing(21px 3px);
    @include absolute(right 0 bottom 11px left 0);

    margin: auto;
    border-radius: 100px;
    background: rgba($c-black, 0.3);
  }

  word-break: break-word;

  flex-direction: column;
  max-height: 80vh;
  max-width: 80vw;
  margin: 10px;
  font-size: $fs-h2;
  font-weight: $fw-bold;
  color: $c-white;
  background-image: linear-gradient(
    -180deg,
    $primary-gradient-start 2%,
    $primary-gradient-end 100%
  );
  opacity: 1;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  user-select: none;
  touch-action: none;
  pointer-events: none;
  will-change: transform, opacity;
  &.isCurrent {
    pointer-events: auto;
  }

  &.isAnimating {
    transition: transform 0.5s $ease-out-back;
  }

  text-decoration: none;
}

.card.stacked {
  @include absolute(0);
  transform: translateY($defaultTranslation) scale($defaultScale);
  transform-origin: 50%, 100%;
  margin: auto;
}

.cardTitle {
  margin: 0 0 15px;
  font-size: $fs-card-title;
}

.card img {
  width: 100%;
}

@for $i from 1 through $cardsTotal {
  $index: $i - 1;
  $translation: $cardsPositionOffset * $index;
  $scale: 1 - ($cardsScaleOffset * $index);

  .card.stacked:nth-child(#{$i}) {
    z-index: $cardsTotal - $index;
    opacity: 1;
    transform: translateY($translation) scale($scale);

    @if $i == 3 {
      color: $c-red-25;
      background-color: $c-red-25;
    } @else if $i == 2 {
      color: $c-red-50;
      background-color: $c-red-50;
    }

    @if $i != 1 {
      background-image: none;

      @include after() {
        @include sizing(0 0);
      }
    }
  }
}

// Stop desktop app from opening card url when it's being dragged
.card.dragstart {
  pointer-events: none;
}

.card .overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba($color: #d94e47, $alpha: 0.8);
  border-radius: 15px;
}

.card .overlay h2,
h3 {
  margin: 0;
}

.card .overlay span {
  margin: 10px;
}

.card .overlay .swipe-price {
  position: absolute;
  top: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.card img {
  object-fit: cover;
  width: 100%;
  height: 40%;
}

.gg-trash {
  --ggs: 1.5;
  box-sizing: border-box;
  position: relative;
  display: block;
  transform: scale(var(--ggs, 1));
  width: 10px;
  height: 12px;
  border: 2px solid transparent;
  box-shadow: 0 0 0 2px, inset -2px 0 0, inset 2px 0 0;
  border-bottom-left-radius: 1px;
  border-bottom-right-radius: 1px;
  margin-top: 4px;
}

.gg-trash::after,
.gg-trash::before {
  content: "";
  display: block;
  box-sizing: border-box;
  position: absolute;
}

.gg-trash::after {
  background: currentColor;
  border-radius: 3px;
  width: 16px;
  height: 2px;
  top: -4px;
  left: -5px;
}

.gg-trash::before {
  width: 10px;
  height: 4px;
  border: 2px solid;
  border-bottom: transparent;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  top: -7px;
  left: -2px;
}

.gg-time {
  --ggs: 1.5;
  box-sizing: border-box;
  position: relative;
  display: block;
  transform: scale(var(--ggs, 1));
  width: 18px;
  height: 18px;
  border-radius: 100%;
  border: 2px solid transparent;
  box-shadow: 0 0 0 2px currentColor;
}

.gg-time::after {
  content: "";
  display: block;
  box-sizing: border-box;
  position: absolute;
  width: 7px;
  height: 7px;
  border-left: 2px solid;
  border-bottom: 2px solid;
  top: 1px;
  left: 5px;
}

.gg-dollar {
  box-sizing: border-box;
  position: relative;
  display: block;
  transform: scale(var(--ggs, 1));
  width: 2px;
  height: 20px;
  background: currentColor;
}

.gg-dollar::after,
.gg-dollar::before {
  content: "";
  display: block;
  box-sizing: border-box;
  position: absolute;
  width: 10px;
  height: 8px;
  border: 2px solid;
}

.gg-dollar::before {
  border-right: 0;
  border-top-left-radius: 100px;
  border-bottom-left-radius: 100px;
  top: 3px;
  left: -6px;
  box-shadow: 4px -2px 0 -2px;
}

.gg-dollar::after {
  border-left: 0;
  border-top-right-radius: 100px;
  border-bottom-right-radius: 100px;
  bottom: 3px;
  right: -6px;
  box-shadow: -4px 2px 0 -2px;
}
</style>
