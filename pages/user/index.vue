<script setup>
definePageMeta({ middleware: "role" });

const { sendLogout, user_id } = useAuth();
const { fetchUserById } = useUsers();
const { emergencies, isLoading, getEmergenciesByUserId, createEmergencies } =
  useEmergencies();
const router = useRouter();

const isCreateModalOpen = ref(false);

// ฟิลด์สำหรับ modal สร้างเหตุฉุกเฉิน
const newType = ref("");
const newTitle = ref("");
const newDescription = ref("");
const newLocation = ref("");
const newMapLink = ref("");

const sortedEmergencies = computed(() => {
  if (!emergencies.value) return [];
  return [...emergencies.value].sort((a, b) => b.created_at - a.created_at);
});

// โหลดข้อมูลเมื่อเปิดหน้า
onMounted(async () => {
  if (user_id.value) {
    await fetchUserById(user_id.value);
    await getEmergenciesByUserId(user_id.value); // เรียกใช้ฟังก์ชันนี้แทน fetchEmergencies
  }
});

// Logout
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

// เปิด modal สร้างเหตุฉุกเฉิน
const openCreateModal = () => {
  newType.value = "";
  newTitle.value = "";
  newDescription.value = "";
  newLocation.value = "";
  newMapLink.value = "";
  isCreateModalOpen.value = true;
};

// ส่งข้อมูลสร้างเหตุฉุกเฉิน
const handleCreateSubmit = async () => {
  if (!newType.value || !newTitle.value) {
    alert("กรุณากรอก ประเภท และ หัวข้อ ให้ครบ");
    return;
  }

  const payload = {
    user_id: user_id.value,
    type: newType.value,
    title: newTitle.value,
    description: newDescription.value,
    location: newLocation.value,
    map_link: newMapLink.value,
  };

  try {
    await createEmergencies(payload);
    isCreateModalOpen.value = false;
    await getEmergenciesByUserId(user_id.value); // โหลดข้อมูลใหม่หลังสร้าง
  } catch (error) {
    alert(
      "เกิดข้อผิดพลาดในการสร้างเหตุฉุกเฉิน: " +
        (error.response?.data?.message || error.message)
    );
  }
};

// ฟังก์ชันสำหรับแปลง URL เป็น embed map
const generateEmbedMap = (url) => {
  try {
    if (!url) return "";

    // Clean up the URL first
    const cleanUrl = url.trim();

    // Handle Google Maps short links (maps.app.goo.gl)
    if (
      cleanUrl.includes("maps.app.goo.gl") ||
      cleanUrl.includes("goo.gl/maps")
    ) {
      // For short links, just use the URL directly with Google Maps embed
      return `https://maps.google.com/maps?q=${encodeURIComponent(
        cleanUrl
      )}&output=embed`;
    }

    // Handle regular Google Maps URLs
    if (
      cleanUrl.includes("google.com/maps") ||
      cleanUrl.includes("maps.google.com")
    ) {
      let embedUrl = cleanUrl;

      // Extract coordinates if available
      const coordMatch = cleanUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordMatch) {
        const lat = coordMatch[1];
        const lng = coordMatch[2];
        return `https://maps.google.com/maps?q=${lat},${lng}&output=embed`;
      }

      // Extract place name if available
      const placeMatch = cleanUrl.match(/\/maps\/place\/([^\/&?]+)/);
      if (placeMatch) {
        const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
        return `https://maps.google.com/maps?q=${encodeURIComponent(
          placeName
        )}&output=embed`;
      }

      // Extract search query from URL parameters
      const qMatch = cleanUrl.match(/[?&]q=([^&]+)/);
      if (qMatch) {
        const query = decodeURIComponent(qMatch[1].replace(/\+/g, " "));
        return `https://maps.google.com/maps?q=${encodeURIComponent(
          query
        )}&output=embed`;
      }

      // If it's already an embed URL, return as is
      if (cleanUrl.includes("output=embed")) {
        return cleanUrl;
      }

      // Convert regular maps URL to embed
      return `https://maps.google.com/maps?q=${encodeURIComponent(
        cleanUrl
      )}&output=embed`;
    }

    // For any other URL or text, treat as a search query
    return `https://maps.google.com/maps?q=${encodeURIComponent(
      cleanUrl
    )}&output=embed`;
  } catch (e) {
    console.error("Error generating embed map:", e);
    // Fallback to simple search
    return `https://maps.google.com/maps?q=${encodeURIComponent(
      url || ""
    )}&output=embed`;
  }
};
</script>

<template>
  <div class="container">
    <header>
      <h1>User Dashboard</h1>
      <div class="user-info">
        <span v-if="user_id">User ID: {{ user_id }}</span>
        <button @click="handleLogout">Logout</button>
      </div>
    </header>

    <main>
      <h2>เหตุฉุกเฉิน</h2>

      <button @click="openCreateModal" style="margin-bottom: 1rem">
        ➕ สร้างเหตุฉุกเฉินของคุณ
      </button>

      <div v-if="isLoading">กำลังโหลดข้อมูล...</div>
      <div v-else-if="emergencies.length === 0">ไม่พบเหตุฉุกเฉิน</div>
      <div v-else>
        <div
          v-for="emergency in sortedEmergencies"
          :key="emergency.id"
          class="card"
        >
          <p><strong>หัวข้อ:</strong> {{ emergency.title }}</p>
          <p><strong>ประเภท:</strong> {{ emergency.type }}</p>
          <p><strong>สถานะ:</strong> {{ emergency.status }}</p>
          <p><strong>รายละเอียด:</strong> {{ emergency.description }}</p>
          <p><strong>สถานที่:</strong> {{ emergency.location }}</p>

          <div v-if="emergency.map_link" class="map-section">
            <strong>แผนที่:</strong>
            <div class="map-container">
              <iframe
                :src="generateEmbedMap(emergency.map_link)"
                width="100%"
                height="300"
                style="border: 0; border-radius: 12px"
                allowfullscreen=""
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            <div class="map-link">
              <a
                :href="emergency.map_link"
                target="_blank"
                class="external-link"
              >
                🔗 เปิดใน Google Maps
              </a>
            </div>
          </div>

          <p v-if="emergency.action_note">
            <strong>หมายเหตุ:</strong> {{ emergency.action_note }}
          </p>
          <p>
            <strong>วันที่แจ้งเหตุ:</strong>
            {{ formatDate(emergency.created_at) }}
          </p>
        </div>
      </div>
    </main>

    <!-- Modal สร้างเหตุฉุกเฉิน -->
    <teleport to="body">
      <div v-if="isCreateModalOpen" class="modal-overlay">
        <div class="modal">
          <h3>สร้างเหตุฉุกเฉินใหม่</h3>

          <label>ประเภท</label>
          <input v-model="newType" placeholder="เช่น ไฟไหม้, อุบัติเหตุ" />

          <label>หัวข้อ</label>
          <input v-model="newTitle" placeholder="กรอกหัวข้อ" />

          <label>รายละเอียด</label>
          <textarea v-model="newDescription" rows="3"></textarea>

          <label>สถานที่</label>
          <input v-model="newLocation" placeholder="สถานที่เกิดเหตุ" />

          <label>ลิงก์แผนที่</label>
          <input v-model="newMapLink" placeholder="https://..." />

          <div class="modal-actions">
            <button @click="isCreateModalOpen = false">ยกเลิก</button>
            <button @click="handleCreateSubmit">บันทึก</button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&family=Noto+Sans+Thai:wght@300;400;500;600;700;800&display=swap");

/* Container */
.container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  font-family: "Sarabun", "Noto Sans Thai", sans-serif;
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
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.02em;
  font-family: "Sarabun", "Noto Sans Thai", sans-serif;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  color: #4b5563;
  font-weight: 600;
  font-family: "Sarabun", "Noto Sans Thai", sans-serif;
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
  font-family: "Sarabun", "Noto Sans Thai", sans-serif;
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

/* Create button margin */
button[style] {
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
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
  line-height: 1.6;
  font-family: "Sarabun", "Noto Sans Thai", sans-serif;
  font-weight: 500;
  word-break: break-word;
}

.card a {
  color: #4338ca;
  text-decoration: underline;
  word-break: break-word;
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
  font-family: "Sarabun", "Noto Sans Thai", sans-serif;
}

/* Form fields */
.modal label {
  display: block;
  margin-top: 1.25rem;
  font-weight: 700;
  color: #4b5563;
  font-size: 0.9rem;
  font-family: "Sarabun", "Noto Sans Thai", sans-serif;
  letter-spacing: 0.01em;
}

.modal input,
.modal textarea {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1.8px solid #d1d5db;
  font-family: "Sarabun", "Noto Sans Thai", sans-serif;
  font-size: 1rem;
  font-weight: 500;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  resize: vertical;
  min-height: 2.75rem;
}

.modal input:focus,
.modal textarea:focus {
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

/* Map Section Styles */
.map-section {
  margin: 15px 0;
}

.map-container {
  margin: 10px 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.map-link {
  margin-top: 8px;
  text-align: center;
}

.external-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #2563eb;
  text-decoration: none;
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.external-link:hover {
  background-color: #eff6ff;
  color: #1d4ed8;
  text-decoration: underline;
}
</style>
