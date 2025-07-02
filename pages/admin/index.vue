<script setup>
definePageMeta({ middleware: "role" });

import { computed, ref, onMounted } from "vue";

// ดึง auth
const { sendLogout, user_id } = useAuth(); // ✅ user_id เป็น ref
const { fetchUserById } = useUsers(); // ✅ ฟังก์ชันดึง user โดย id
const { emergencies, isLoading, fetchEmergencies, updateEmergencies } = useEmergencies();
const router = useRouter();

// โหลดข้อมูลเมื่อหน้าเพจเปิด
onMounted(async () => {
  if (user_id.value) {
    await fetchUserById(user_id.value); // ✅ ต้องใช้ .value
  }
  await fetchEmergencies();
});

// ออกจากระบบ
const handleLogout = async () => {
  await sendLogout();
  router.push("/login");
};

// แปลง timestamp เป็นวันที่ไทย
const formatDate = (timestamp) => {
  if (!timestamp) return "ไม่ระบุ";
  return new Date(timestamp * 1000).toLocaleString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// modal state
const isModalOpen = ref(false);
const selectedEmergency = ref(null);
const modalNote = ref("");
const modalStatus = ref("");

// เปิด modal แก้ไข
const openEditModal = (emergency) => {
  selectedEmergency.value = emergency;
  modalNote.value = emergency.action_note || "";
  modalStatus.value = emergency.status || "รอการตอบสนอง";
  isModalOpen.value = true;
};

// บันทึกการแก้ไข
const handleModalSubmit = async () => {
  if (!selectedEmergency.value || !user_id.value) {
    console.warn("Missing selected emergency or user_id");
    return;
  }

  await updateEmergencies(
    {
      status: modalStatus.value,
      action_note: modalNote.value,
      officer_id: user_id.value, // ✅ ส่ง officer_id จาก user_id
    },
    selectedEmergency.value.id
  );

  isModalOpen.value = false;
  selectedEmergency.value = null;
  await fetchEmergencies();
  console.log("user_id:", user_id.value);
};

// computed สำหรับจัดกลุ่ม emergencies ตาม type
const groupedByType = computed(() => {
  if (!emergencies.value || emergencies.value.length === 0) return {};
  return emergencies.value.reduce((groups, item) => {
    const type = item.type || "ไม่ระบุประเภท";
    if (!groups[type]) groups[type] = [];
    groups[type].push(item);
    return groups;
  }, {});
});
</script>

<template>
  <div class="container">
    <header>
      <h1>Admin Dashboard</h1>
      <div class="user-info">
        <span v-if="user_id">Admin ID: {{ user_id }}</span>
        <button @click="handleLogout">Logout</button>
      </div>
    </header>

    <main>
      <h2>เหตุฉุกเฉิน</h2>

      <div v-if="isLoading">กำลังโหลดข้อมูล...</div>
      <div v-else-if="emergencies.length === 0">ไม่พบเหตุฉุกเฉิน</div>
      <div v-else>
        <div
          v-for="emergency in emergencies"
          :key="emergency.id"
          class="card"
        >
          <p><strong>หัวข้อ:</strong> {{ emergency.title }}</p>
          <p><strong>ประเภท:</strong> {{ emergency.type }}</p>
          <p><strong>สถานะ:</strong> {{ emergency.status  }}</p>
          <p><strong>รายละเอียด:</strong> {{ emergency.description }}</p>
          <p><strong>สถานที่:</strong> {{ emergency.location }}</p>

          <p v-if="emergency.map_link">
            <strong>แผนที่:</strong>
            <a :href="emergency.map_link" target="_blank">{{ emergency.map_link }}</a>
          </p>

          <p v-if="emergency.action_note"><strong>หมายเหตุ:</strong> {{ emergency.action_note }}</p>
          <p><strong>วันที่แจ้งเหตุ:</strong> {{ formatDate(emergency.created_at) }}</p>

          <div class="actions">
            <!-- ปุ่ม แก้ไข แสดงเฉพาะเมื่อ status เป็น รอการตอบสนอง หรือ กำลังดำเนินการ -->
            <button
              v-if="emergency.status === 'รอการตอบสนอง' || emergency.status === 'กำลังดำเนินการ'"
              @click="openEditModal(emergency)"
            >
              ✏️ แก้ไข
            </button>
          </div>
        </div>
      </div>

      <!-- แสดง grouped emergencies -->
      <section class="grouped-emergencies" v-if="emergencies.length > 0">
        <h2>เหตุฉุกเฉิน แยกตามประเภท</h2>
        <div v-for="(group, type) in groupedByType" :key="type" class="group">
          <h3 class="group-title">{{ type }}</h3>
          <div class="group-list">
            <div v-for="emergency in group" :key="emergency.id" class="card small-card">
              <p><strong>หัวข้อ:</strong> {{ emergency.title }}</p>
              <p><strong>สถานะ:</strong> {{ emergency.status }}</p>
              <p><strong>วันที่แจ้งเหตุ:</strong> {{ formatDate(emergency.created_at) }}</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Modal แก้ไข -->
    <teleport to="body">
      <div v-if="isModalOpen" class="modal-overlay">
        <div class="modal">
          <h3>แก้ไขเหตุฉุกเฉิน</h3>

          <label>สถานะ</label>
          <select v-model="modalStatus">
            <option>รอการตอบสนอง</option>
            <option>กำลังดำเนินการ</option>
            <option>เสร็จสิ้น</option>
          </select>

          <label>หมายเหตุ</label>
          <textarea v-model="modalNote" rows="3" />

          <div class="modal-actions">
            <button @click="isModalOpen = false">ยกเลิก</button>
            <button @click="handleModalSubmit">บันทึก</button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<style scoped>
/* Container */
.container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f9fafb;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.1);
}

/* Header */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
}

header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.02em;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  color: #4b5563;
  font-weight: 600;
}

.user-info span {
  background: #e0e7ff;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px; /* pill shape */
  color: #4338ca;
  font-size: 0.875rem;
  user-select: none;
}

/* Buttons */
button {
  background-color: #4338ca;
  color: white;
  border: none;
  padding: 0.6rem 1.4rem;
  border-radius: 9999px; /* pill shape */
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 6px rgb(67 56 202 / 0.35);
}

button:hover {
  background-color: #3730a3;
  box-shadow: 0 6px 12px rgb(55 48 163 / 0.45);
}

button:focus {
  outline: none;
  box-shadow: 0 0 0 4px rgb(67 56 202 / 0.3);
}

/* Card */
.card {
  background-color: white;
  padding: 1.75rem 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 20px rgb(0 0 0 / 0.08);
  margin-bottom: 1.25rem;
  transition: box-shadow 0.3s ease;
}

.card:hover {
  box-shadow: 0 14px 28px rgb(0 0 0 / 0.12);
}

.card p {
  margin: 0.5rem 0;
  color: #374151;
  font-size: 1rem;
  line-height: 1.5;
  word-break: break-word;
}

.card a {
  color: #4338ca;
  text-decoration: underline;
  word-break: break-word;
}

/* Actions */
.actions {
  margin-top: 1rem;
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(67, 56, 202, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(8px);
  z-index: 9999;
}

/* Modal */
.modal {
  background-color: white;
  padding: 2.5rem 2rem;
  border-radius: 20px;
  width: 90%;
  max-width: 480px;
  box-shadow: 0 16px 48px rgb(67 56 202 / 0.3);
  font-size: 1rem;
  color: #111827;
  user-select: none;
  display: flex;
  flex-direction: column;
}

.modal h3 {
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
  font-weight: 800;
  color: #4338ca;
  text-align: center;
  letter-spacing: -0.02em;
}

/* Form fields */
.modal label {
  display: block;
  margin-top: 1.25rem;
  font-weight: 700;
  color: #4b5563;
  font-size: 0.9rem;
  letter-spacing: 0.01em;
}

.modal input,
.modal textarea,
.modal select {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1.8px solid #d1d5db;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  resize: vertical;
  min-height: 2.75rem;
}

.modal input:focus,
.modal textarea:focus,
.modal select:focus {
  border-color: #4338ca;
  box-shadow: 0 0 8px rgb(67 56 202 / 0.5);
  outline: none;
}

/* Modal buttons */
.modal-actions {
  margin-top: 2.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1.5rem;
}

.modal-actions button:first-child {
  background-color: #f3f4f6;
  color: #6b7280;
  font-weight: 700;
  box-shadow: none;
  padding: 0.6rem 1.4rem;
  border-radius: 9999px;
  transition: background-color 0.3s ease;
}

.modal-actions button:first-child:hover {
  background-color: #e5e7eb;
  color: #4b5563;
}

.modal-actions button:last-child {
  background-color: #4338ca;
  color: white;
  font-weight: 700;
  box-shadow: 0 4px 10px rgb(67 56 202 / 0.6);
  padding: 0.6rem 1.6rem;
  border-radius: 9999px;
}

.modal-actions button:last-child:hover {
  background-color: #3730a3;
  box-shadow: 0 6px 14px rgb(55 48 163 / 0.7);
}

/* Grouped Emergencies Section */
.grouped-emergencies {
  margin-top: 3rem;
  border-top: 2px solid #4338ca;
  padding-top: 2rem;
}

.group {
  margin-bottom: 2rem;
}

.group-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #4338ca;
  border-bottom: 2px solid #4338ca;
  padding-bottom: 0.3rem;
  margin-bottom: 1rem;
}

.group-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.small-card {
  background-color: #eef2ff;
  padding: 1rem 1.2rem;
  border-radius: 12px;
  box-shadow: 0 6px 15px rgb(67 56 202 / 0.15);
  font-size: 0.9rem;
  color: #3730a3;
  flex: 1 1 250px;
  word-break: break-word;
}
</style>
