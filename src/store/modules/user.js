import { login, getAuthMenu, getRoleList } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    userCode: '',
    authMenu: [],
    userRoleList: []
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_CODE: (state, code) => {
    state.userCode = code
  },
  SET_ROLELIST: (state, list) => {
    state.userRoleList = list
  },
  SET_AUTHMENU: (state, authMenu) => {
    state.authMenu = authMenu
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    // const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ ...userInfo }).then(response => {
        const { data } = response
        if (data.return_code === '0') {
          commit('SET_TOKEN', data.user_token)
          commit('SET_NAME', data.nick_name)
          commit('SET_CODE', data.operator_code)
          setToken(data.user_token)
          resolve()
        } else {
          reject(data)
        }
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get role list
  getRoleList({ commit, state }) {
    return new Promise((resolve, reject) => {
      getRoleList({ 'operator_code': state.userRoleList }).then(response => {
        const { data } = response

        if (!data) {
          return reject('roles get failed, please Login again.')
        }
        const roles = data.user_role_list
        commit('SET_ROLELIST', roles)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get auth menu
  getAuthMenu({ commit, state }) {
    return new Promise((resolve, reject) => {
      getAuthMenu(state.token).then(response => {
        const { data } = response

        if (!data) {
          return reject('menu get failed, please Login again.')
        }
        commit('SET_AUTHMENU', data)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      removeToken() // must remove  token  first
      resetRouter()
      commit('RESET_STATE')
      resolve()
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

