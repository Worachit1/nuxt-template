<template>
  <div class="min-h-screen flex items-center justify-center login-container">
    <div class="login-form-wrapper">
      <form @submit.prevent="onLogin" class="login-form">
        <div class="form-header">
          <h2 class="form-title">Welcome Back</h2>
          <p class="form-subtitle">Please sign in to your account</p>
        </div>

        <div class="form-group">
          <label for="email" class="form-label">
            <i class="email-icon">📧</i>
            Email Address
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            placeholder="Enter your email address"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">
            <i class="password-icon">🔒</i>
            Password
          </label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            placeholder="Enter your password"
            class="form-input"
          />
        </div>

        <div v-if="error" class="error-message">
          <i class="error-icon">⚠️</i>
          {{ error }}
        </div>

        <button type="submit" :disabled="isLoading" class="login-button">
          <span v-if="!isLoading" class="button-text">
            <i class="login-icon">🚀</i>
            Sign In
          </span>
          <span v-else class="button-loading">
            <i class="loading-spinner">⏳</i>
            Signing in...
          </span>
        </button>

        <div class="form-footer">
          <p class="register-text">
            Don't have an account?
            <NuxtLink to="/register" class="register-link">
              Create one here
            </NuxtLink>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
const form = ref({
  email: '',
  password: ''
})

const error = ref('')
const isLoading = ref(false)

const router = useRouter()
const { sendAuth } = useAuth() // composable ที่ติดต่อกับ API

const onLogin = async () => {
  error.value = ''
  isLoading.value = true

  try {
    const result = await sendAuth(form.value)
    isLoading.value = false

    if (result.success) {
      const token = result.token
      const userData = result.userData
      const role = userData?.role || 'user'

      useCookie('token').value = token
      useCookie('user').value = userData

      if (role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/user')
      }
    } else {
      error.value = result.error || 'Invalid email or password'
    }
  } catch (err) {
    error.value = 'Network error. Please try again.'
    isLoading.value = false
  }
}

onMounted(() => {
  const emailInput = document.getElementById('email')
  emailInput?.focus()
})
</script>

<style scoped>
.login-container {
  background: linear-gradient(to right, #667eea, #764ba2);
  padding: 2rem;
}

.login-form-wrapper {
  background-color: white;
  padding: 2rem;
  border-radius: 1rem;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.login-form {
  display: flex;
  flex-direction: column;
}

.form-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.form-title {
  font-size: 1.75rem;
  font-weight: bold;
  color: #333;
}

.form-subtitle {
  font-size: 0.95rem;
  color: #666;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.4rem;
  color: #444;
}

.form-input {
  width: 100%;
  padding: 0.65rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #ccc;
  font-size: 1rem;
  outline: none;
  transition: 0.3s;
}

.form-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
}

.error-message {
  color: #e53e3e;
  background-color: #fff5f5;
  border: 1px solid #feb2b2;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.login-button {
  background-color: #667eea;
  color: white;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 0.5rem;
  border: none;
  transition: background 0.3s;
  cursor: pointer;
}

.login-button:hover {
  background-color: #5a67d8;
}

.login-button:disabled {
  background-color: #a3bffa;
  cursor: not-allowed;
}

.button-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.form-footer {
  text-align: center;
  margin-top: 1rem;
}

.register-text {
  font-size: 0.9rem;
  color: #555;
}

.register-link {
  color: #667eea;
  font-weight: bold;
  text-decoration: none;
}

.register-link:hover {
  text-decoration: underline;
}

.email-icon,
.password-icon,
.error-icon,
.login-icon {
  margin-right: 0.25rem;
}
</style>
