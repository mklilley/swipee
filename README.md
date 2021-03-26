# [Swipee](https://swipee.lilley.io/) - The no-list reading list app

<a href="https://swipee.lilley.io/" target="_blank"><img src="https://swipee.lilley.io/img/logo.5068bce4.svg"></a>

<a href="https://www.buymeacoffee.com/mklilley" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height = "60" ></a>

## Why Swipee?

**Reading lists suck!** If you're anything like me, then you're interested in everything but see opportunity cost around every corner. Save everything for later and then get paralysed by choice. Hunker down for a long read, watch a quick video or catch up with one of the dozens of podcasts you subscribe to ? 😣

Swipee makes the choice for you. Instead of a reading list, Swipee uses a deck of swipeable cards - left to discard, right to save for later. This way, you'll never have to see your ever growing list of content 🙌 . Swipee also helps you to be more honest about the content you want to save for later. By using financial incentives, Swipee encourages you to think twice before you swipe right.

## The history of Swipee

I built a basic version of Swipee in the Spring of 2018 and have been using it every day since. I thought other people might also find it useful, so in Spring 2021 I decided to clean it up and make it available to everyone for free.

## How I made Swipee

Here is a rough guide to how I got here.

### Front end

The Swipee front end is built using [Vue.js version 3](https://v3.vuejs.org/guide/introduction.html). I used the [Vue CLI version 4.5.11](https://cli.vuejs.org/) to create the project and then added [Progressive Web App (PWA)](https://web.dev/progressive-web-apps/) capability

- `npm install -g @vue/cli`
- `vue create swipee`
- `vue add pwa`

I consulted the [Vue PWA documentation](https://cli.vuejs.org/core-plugins/pwa.html#configuration) to help me with the config and used the [Vue PWA asset generator](https://github.com/jcalixte/vue-pwa-asset-generator) to generate all the necessary icons.

In order for Swipee to update on iOS when it's installed on the home screen, I needed to add:

```
workboxOptions: {
  skipWaiting: true
}
```

to the pwa setting in `vue.config.js`

Swipee uses a swipeable cards UI that heavily draws upon the work of [Mateusz Rybczonek](https://madewithvuejs.com/swipeable-cards). Mateusz's project uses Sass for the css and uses [interact.js](https://interactjs.io/) to make the cards dragable. I therefore needed to install the `sass-loader` (described in the [Vue css docs](https://cli.vuejs.org/guide/css.html#postcss)) and install the `interactjs` library. Specifically:

- `npm install -D sass-loader sass`
- `npm install --save interactjs`

To filter the cards, I needed to adapt [v-chips-multiselect](https://github.com/zisuzon/v-chips-multiselect) - originally designed for vue2. This involved using [vue3-click-away](https://github.com/VinceG/vue-click-away) among other changes - see `src/components/ChipsMultiselect.vue` for more details.

I use Google's [recaptcha](https://www.google.com/recaptcha) with [vue-recaptcha](https://github.com/DanSnow/vue-recaptcha) to protect my feedback form from spam - noting to use the `vue-v3` branch via:

- `npm install "https://github.com/DanSnow/vue-recaptcha.git#vue-v3" --save`

In order to take payments, I used [Stripe](https://stripe.com/docs) and in particular I used their [integration builder](https://stripe.com/docs/checkout/integration-builder) selecting the `Custom payment flow` to avoid redirects and page reloads that come with usual payment flow. I combined and adapted the `checkout.html` `client.js` and `global.css` into a single component `src/components/Payment.vue`. To make stripe work inside of a vue component I needed to include the `stripe-js` module:

- `npm install @stripe/stripe-js --save`

To speed up the download time of the app, I followed this [performance optimisation article](https://medium.com/@aetherus.zhou/vue-cli-3-performance-optimization-55316dcd491c) and opted for "lazy loading" of routes and also compression of the build files. Because Vue3 uses webpack version 4, I needed to use a less up to date version of the `compression-webpack-plugin` to avoid build errors. Specifically:

- `npm install --save-dev compression-webpack-plugin@6.1.1`
