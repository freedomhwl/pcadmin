import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import getters from './getters'
import app from './modules/app'
import settings from './modules/settings'
import user from './modules/user'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    settings,
    user
  },
  getters,
  plugins: [createPersistedState({
    paths: ['user']
    // reducer(val) {
    //   return {
    //     name: val.user.name,
    //     userCode: val.user.userCode
    //   }
    // }
  })]
})

export default store
