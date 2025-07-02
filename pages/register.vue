<!-- pages/login.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <form
      @submit.prevent="onRegister"
      class="bg-white p-8 rounded shadow-md w-full max-w-md space-y-5"
    >
      <h2 class="text-2xl font-semibold text-center">Register</h2>

      <div class="flex flex-col">
        <label for="first_name" class="mb-1 text-sm font-medium text-gray-700"
          >First Name</label
        >
        <input
          id="first_name"
          v-model="form.first_name"
          type="text"
          required
          placeholder="Enter your first name"
          class="border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div class="flex flex-col">
        <label for="last_name" class="mb-1 text-sm font-medium text-gray-700"
          >Last Name</label
        >
        <input
          id="last_name"
          v-model="form.last_name"
          type="text"
          required
          placeholder="Enter your last name"
          class="border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div class="flex flex-col">
        <label
          for="student_number"
          class="mb-1 text-sm font-medium text-gray-700"
          >Student Number</label
        >
        <input
          id="student_number"
          v-model="form.student_number"
          type="text"
          required
          placeholder="Enter your student number"
          class="border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div class="flex flex-col">
        <label for="email" class="mb-1 text-sm font-medium text-gray-700"
          >Email</label
        >
        <input
          id="email"
          v-model="form.email"
          type="email"
          required
          placeholder="Enter your email"
          class="border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div class="flex flex-col">
        <label for="phone" class="mb-1 text-sm font-medium text-gray-700"
          >Phone</label
        >
        <input
          id="phone"
          v-model="form.phone"
          type="tel"
          required
          placeholder="Enter your phone number"
          class="border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div class="flex flex-col">
        <label for="address" class="mb-1 text-sm font-medium text-gray-700"
          >Address</label
        >
        <textarea
          id="address"
          v-model="form.address"
          required
          placeholder="Enter your address"
          rows="3"
          class="border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 resize-vertical"
        ></textarea>
      </div>

      <div class="flex flex-col">
        <label for="password" class="mb-1 text-sm font-medium text-gray-700"
          >Password</label
        >
        <input
          id="password"
          v-model="form.password"
          type="password"
          required
          placeholder="Enter your password"
          class="border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div v-if="error" class="text-red-600 text-sm text-center">
        {{ error }}
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isLoading ? "Registering..." : "Register" }}
      </button>

      <div class="text-center mt-4">
        <p class="text-sm text-gray-600">
          Already have an account?
          <NuxtLink
            to="/login"
            class="text-green-500 hover:text-green-600 font-medium"
            >Login here</NuxtLink
          >
        </p>
      </div>
    </form>
  </div>
</template>

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
