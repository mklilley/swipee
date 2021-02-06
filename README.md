# [Swipee](https://swipee.lilley.io/) - //TODO Tagline

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

To speed up the download time of the app, I followed this [performance optimisation article](https://medium.com/@aetherus.zhou/vue-cli-3-performance-optimization-55316dcd491c) and opted for "lazy loading" of routes and also compression of the build files. Because Vue3 uses webpack version 4, I needed to use a less up to date version of the `compression-webpack-plugin` to avoid build errors. Specifically:

```
npm install --save-dev compression-webpack-plugin@6.1.1
```

Swipee uses a swipable cards UI that is heavily drawing upon the work of [Mateusz Rybczonek](https://madewithvuejs.com/swipeable-cards). Mateusz's project uses Sass for the css and uses [interact.js](https://interactjs.io/) to make the cards dragable. I therefore needed to add the `sass-loader` as described in the [Vue css docs](https://cli.vuejs.org/guide/css.html#postcss) and install the `interactjs` library:

- `npm install -D sass-loader sass`
- `npm install --save interactjs`
