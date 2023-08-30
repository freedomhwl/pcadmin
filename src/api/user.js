import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/ms/g/hsxone.omc/v/submitLogin',
    method: 'post',
    data
  })
}

export function getAuthMenu(data) {
  return request({
    url: '/ms/g/hsxone.omc/v/getUserAuthMenus',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: '/vue-admin-template/user/logout',
    method: 'post'
  })
}

export function getValidateCode(data = {}) {
  return request({
    url: '/ms/g/hsxone.omc/v/loginHasValidateCode',
    method: 'post',
    data
  })
}

export function getVerifyCode(data = {}) {
  return request({
    url: '/ms/g/hsxone.omc/v/getVerifyCode',
    method: 'post',
    data
  })
}
