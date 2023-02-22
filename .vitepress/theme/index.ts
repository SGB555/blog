import DefaultTheme from 'vitepress/theme'
import Archives from './components/Archives.vue'
import Tags from './components/Tags.vue'
import MyLayout from './components/MyLayout.vue'
import './custom.css'
import { EnhanceAppContext } from 'vitepress'

export default {
  ...DefaultTheme,
  Layout: MyLayout,
  enhanceApp(ctx: EnhanceAppContext) {
    DefaultTheme.enhanceApp(ctx)
    const { app } = ctx
    // register global components
    app.component('Archives', Archives)
    app.component('Tags', Tags)
  }
}
