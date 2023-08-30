<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on" label-position="left">

      <div class="title-container">
        <h3 class="title">登录</h3>
      </div>

      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="username"
          v-model="loginForm.username"
          placeholder="Username"
          name="username"
          type="text"
          tabindex="1"
          auto-complete="on"
        />
      </el-form-item>

      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input
          :key="passwordType"
          ref="password"
          v-model="loginForm.password"
          :type="passwordType"
          placeholder="Password"
          name="password"
          tabindex="2"
          auto-complete="on"
          @keyup.enter.native="handleLogin"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>
      <el-form-item v-if="isCheckCodeEnabled" prop="checkcode">
        <el-input
          ref="checkcode"
          v-model="loginForm.checkcode"
          :maxlength="4"
          placeholder="验证码"
        />
        <div class="checkcode" @click="refreshCheckCode">
          <img :src="checkCodeUrl">
        </div>
      </el-form-item>
      <div v-if="isCheckCodeEnabled && !isCheckcodeValid" class="verification-text">
        {{ checkcodeTipMessage }}
      </div>
      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="handleLogin">Login</el-button>
    </el-form>
  </div>
</template>

<script>
import { validUsername } from '@/utils/validate'
import { encryptParam } from '@/utils/index'
import { getValidateCode, getVerifyCode } from '@/api/user'

export default {
  name: 'Login',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('Please enter the correct user name'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('The password can not be less than 6 digits'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        username: '',
        password: '',
        checkcode: ''
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined,
      isCheckCodeEnabled: false,
      checkCodeUrl: '',
      checkCodeId: '',
      isCheckcodeValid: true,
      checkcodeTipMessage: ''
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    },
    'loginForm.checkcode': {
      handler() {
        // 重置表单图片验证码校验信息
        this.isCheckcodeValid = true
      }
    }
  },
  mounted() {
    this.hasCheckCode()
  },
  methods: {
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          const data = {
            operator_code: encryptParam(this.loginForm.username),
            password: encryptParam(this.loginForm.password),
            verify_code: this.loginForm.checkcode,
            uuid: this.checkCodeId
          }
          this.$store.dispatch('user/login', data).then(() => {
            this.$router.push({ path: this.redirect || '/' })
            this.loading = false
          }).catch((data) => {
            // 密码输入错误
            if (data.return_code === '-1') {
              this.$message.error(data.return_info)
            }
            if (data.return_code === '-10') {
              this.isCheckCodeEnabled = true
            }
            // 验证码输入错误
            if (data.return_code === '-10' && (data.return_info.includes('验证码不能为空') || data.return_info.includes('登录验证码错误'))) {
              this.isCheckcodeValid = false
              this.checkcodeTipMessage = data.return_info
            }
            this.isCheckCodeEnabled && this.refreshCheckCode()
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    hasCheckCode() {
      getValidateCode().then(res => {
        if ((res.data ?? res) + '' === 'true') {
          this.isCheckCodeEnabled = true
          this.refreshCheckCode()
        }
      })
    },
    refreshCheckCode() {
      getVerifyCode()
        .then((res) => {
          const { img, id } = res.data
          this.checkCodeUrl = `data:image/png;base64,${img}`
          this.checkCodeId = id
        })
        .catch((error) => {
          return console.error(error)
        })
    }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg:#283443;
$light_gray:#fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
    .checkcode {
      width: 100px;
      height: 47px;
      position: absolute;
      right: 0px;
      cursor: pointer;
      top: 0px;
    }
    .verification-text{
      color: #f14c5d;
      padding: 5px 15px;
    }
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}
</style>
