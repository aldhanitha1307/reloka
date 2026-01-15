// ===== RBAC Configuration =====
// Daftar NIPEG yang memiliki akses Admin
const ADMIN_USERS = [
  "7301003S",
  "7394006S",
  "7394009S",
  "7401031S",
  "7501010S",
  "7594064S",
  "7602007A",
  "7801016S",
  "7804003R2",
  "7805003L",
  "7806054Z",
  "7904006H2",
  "8106545Z",
  "8611977Z",
  "88111988Z",
  "8914838ZY",
  "7090021S",
  "7101011S",
  "7805002D",
  "7806086Z",
  "8407275Z",
];

// Developer bebas login
const developerList = ["202231057"];

// === Cek Admin ===
function isAdmin(nipeg) {
  return ADMIN_USERS.includes(nipeg) || developerList.includes(nipeg);
}

// === Dapatkan Role ===
function getUserRole(nipeg) {
  return isAdmin(nipeg) ? "admin" : "user";
}

// Untuk environment Node (opsional)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { ADMIN_USERS, developerList, isAdmin, getUserRole };
}
