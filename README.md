# [Swipee](https://swipee.lilley.io/) - //TODO Tagline

## How I made Swipee

Here is a rough guide to how I got here.

### Front end

The Swipee front end is built using [Vue.js version 3](https://v3.vuejs.org/guide/introduction.html). I used the [Vue CLI version 4.5.11](https://cli.vuejs.org/) to create the project and then added [Progressive Web App (PWA)](https://web.dev/progressive-web-apps/) capability

- `npm install -g @vue/cli`
- `vue create swipee`
- `vue add pwa`

Swipee uses a swipable cards UI that is heavily drawing upon the work of [Mateusz Rybczonek](https://madewithvuejs.com/swipeable-cards). Mateusz's project uses Sass for the css and uses [interact.js](https://interactjs.io/) to make the cards dragable. I therefore needed to add the `sass-loader` as described in the [Vue css docs](https://cli.vuejs.org/guide/css.html#postcss) and install the `interactjs` library:

- `npm install -D sass-loader sass`
- `npm install --save interactjs`
