
<script setup>
const form = ref({
  first_name: "",
  last_name: "",
  student_number: "",
  email: "",
  phone: "",
  address: "",
  password: "",
});

const isLoading = ref(false);
const error = ref("");
const router = useRouter();
const authStore = useAuth();

const onRegister = async () => {
  console.log(form.value);
  error.value = "";
  isLoading.value = true;

  try {
    await authStore.sendRegister(form.value);
    router.push("/login");
  } catch (err) {
    error.value = err.message || "Registration failed. Please try again.";
    console.error("Registration error:", err);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="register-container">
    <div class="register-form-wrapper">
      <form @submit.prevent="onRegister" class="register-form">
        <div class="form-header">
          <h2 class="form-title">Register</h2>
          <p class="form-subtitle">Create your student account</p>
        </div>

        <div class="form-group">
          <label for="first_name" class="form-label">First Name</label>
          <input
            id="first_name"
            v-model="form.first_name"
            type="text"
            class="form-input"
            placeholder="Enter your first name"
            required
          />
        </div>

        <div class="form-group">
          <label for="last_name" class="form-label">Last Name</label>
          <input
            id="last_name"
            v-model="form.last_name"
            type="text"
            class="form-input"
            placeholder="Enter your last name"
            required
          />
        </div>

        <div class="form-group">
          <label for="student_number" class="form-label">Student Number</label>
          <input
            id="student_number"
            v-model="form.student_number"
            type="text"
            class="form-input"
            placeholder="Enter your student number"
            required
          />
        </div>

        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-input"
            placeholder="Enter your email"
            required
          />
        </div>

        <div class="form-group">
          <label for="phone" class="form-label">Phone</label>
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            class="form-input"
            placeholder="Enter your phone number"
            required
          />
        </div>

        <div class="form-group">
          <label for="address" class="form-label">Address</label>
          <textarea
            id="address"
            v-model="form.address"
            rows="3"
            class="form-input"
            placeholder="Enter your address"
            required
          ></textarea>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-input"
            placeholder="Enter your password"
            required
          />
        </div>

        <div v-if="error" class="error-message">
          ⚠️ {{ error }}
        </div>

        <button
          type="submit"
          class="login-button"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="button-loading">⏳ Registering...</span>
          <span v-else>Register</span>
        </button>

        <div class="form-footer">
          <p class="register-text">
            Already have an account?
            <NuxtLink to="/login" class="register-link">Login here</NuxtLink>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  background: linear-gradient(to right, #667eea, #764ba2);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.register-form-wrapper {
  background-color: white;
  padding: 2rem;
  border-radius: 1rem;
  max-width: 460px;
  width: 100%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.register-form {
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
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
}

textarea.form-input {
  resize: vertical;
  min-height: 90px;
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
</style>



