// Variable untuk menyimpan data jabatan yang dipilih
let selectedJabatan = null;
let currentUserRole = "user"; // Default role

// Check if user is logged in
auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    loadUserData();
    loadJabatanKosong();
    displayCurrentDate();
    initMenuNavigation();
  }
});

// Load user data dan check role
function loadUserData() {
  const nipeg = localStorage.getItem("NIPEG");

  if (nipeg) {
    document.getElementById("userNipeg").textContent = nipeg;

    // Check user role
    currentUserRole = getUserRole(nipeg);
    document.getElementById("userRole").textContent =
      currentUserRole === "admin" ? "👑 Admin" : "👤 User";

    db.collection("pegawai")
      .doc(nipeg)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const data = doc.data();
          const nama = data.Nama || data.Email || "User";
          document.getElementById("userName").textContent = nama;
        } else {
          document.getElementById("userName").textContent = "User";
        }

        // 🔥 TEMPAT MENAMBAHKAN MENU ADMIN (INI POSISI YANG BENAR)
        const menuDetail = document.getElementById("menuDetailRiwayat");
        if (currentUserRole === "admin" && menuDetail) {
          menuDetail.style.display = "flex";
        }
      })
      .catch((error) => {
        console.error("Error getting user data:", error);
        document.getElementById("userName").textContent = "User";
      });
  }
}

// Display current date
function displayCurrentDate() {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const today = new Date();
  const dateString = today.toLocaleDateString("id-ID", options);
  document.getElementById("currentDate").textContent = dateString;
}

// Load data jabatan kosong dari Firestore
function loadJabatanKosong() {
  const tbody = document.querySelector("#tabelJabatanKosong tbody");
  tbody.innerHTML =
    '<tr><td colspan="28" style="text-align: center;">Loading...</td></tr>';

  db.collection("pegawai")
    .get()
    .then((querySnapshot) => {
      tbody.innerHTML = "";

      if (querySnapshot.empty) {
        tbody.innerHTML =
          '<tr><td colspan="28" style="text-align: center;">Tidak ada data jabatan kosong</td></tr>';
        return;
      }

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const nipeg = doc.id;

        const row = document.createElement("tr");
        row.innerHTML = `
                    <td>${nipeg}</td>
                    <td>${data.PersNo || "-"}</td>
                    <td>${data.PersonnelNumber || "-"}</td>
                    <td>${data.NamaPanjangPosisi || "-"}</td>
                    <td>${data.NamaPendekPosisiAtasan || "-"}</td>
                    <td>${data.NamaPanjangPosisiSIMKP || "-"}</td>
                    <td>${data.PersonnelNumberAtasan || "-"}</td>
                    <td>${data.NIPEGAtasan || "-"}</td>
                    <td>${data.NamaAtasan || "-"}</td>
                    <td>${data.TelephoneNo || "-"}</td>
                    <td>${data.Email || "-"}</td>
                    <td>${data.BusinessArea || "-"}</td>
                    <td>${data.PersonnelSubarea || "-"}</td>
                    <td>${data.TanggalGradeTerakhir || "-"}</td>
                    <td>${data.GenderKey || "-"}</td>
                    <td>${data.Birthplace || "-"}</td>
                    <td>${data.BirthDate || "-"}</td>
                    <td>${data.PSgroup || "-"}</td>
                    <td>${data.Lv || "-"}</td>
                    <td>${data.JenjangMainGrpText || "-"}</td>
                    <td>${data.JenjangSubGrpText || "-"}</td>
                    <td>${data.OrganizationalUnit || "-"}</td>
                    <td>${data.PendidikanTerakhir || "-"}</td>
                    <td>${data.MaritalStatusKey || "-"}</td>
                    <td>${data.StreetandHouseNumber || "-"}</td>
                    <td>${data.City || "-"}</td>
                    <td>${data.Position || "-"}</td>
                    <td>
                        <button class="btn-detail" data-nipeg="${nipeg}">Detail</button>
                    </td>
                `;

        tbody.appendChild(row);
      });

      attachDetailButtonListeners();
    })
    .catch((error) => {
      console.error("Error loading jabatan kosong:", error);
      tbody.innerHTML =
        '<tr><td colspan="28" style="text-align: center; color: red;">Error loading data</td></tr>';
    });
}

// Attach event listeners untuk tombol detail
function attachDetailButtonListeners() {
  document.querySelectorAll(".btn-detail").forEach((button) => {
    button.addEventListener("click", function () {
      const nipeg = this.getAttribute("data-nipeg");
      loadDetailJabatan(nipeg);
    });
  });
}

// Load detail jabatan dari sub-collection detail_riwayat
function loadDetailJabatan(nipeg) {
  console.log("Loading detail for NIPEG:", nipeg);

  // ✅ SEMUA USER BISA LIHAT DETAIL (tidak ada pengecekan role di sini)

  db.collection("pegawai")
    .doc(nipeg)
    .collection("detail_riwayat")
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        alert("Detail riwayat tidak ditemukan untuk jabatan ini");
        return;
      }

      selectedJabatan = {
        nipeg: nipeg,
      };

      console.log("Selected jabatan:", selectedJabatan);

      switchPage("usulan");
      displayDetailJabatan();
    })
    .catch((error) => {
      console.error("Error getting detail riwayat:", error);
      alert("Gagal mengambil detail: " + error.message);
    });
}

// Tampilkan detail jabatan sebagai tabel
function displayDetailJabatan() {
  if (!selectedJabatan) return;

  const detailSection = document.getElementById("detailJabatanSection");
  const formSection = document.getElementById("formUsulanSection");
  const emptyMessage = document.getElementById("usulanEmptyMessage");
  const noAccessMessage = document.getElementById("usulanNoAccessMessage");
  const container = document.getElementById("detailJabatanContainer");
  const btnUsulkan = document.getElementById("btnUsulkan");

  // ✅ Semua user bisa lihat detail
  detailSection.style.display = "block";
  formSection.style.display = "none";
  if (emptyMessage) emptyMessage.style.display = "none";
  if (noAccessMessage) noAccessMessage.style.display = "none";

  // ✅ Tapi button "Usulkan" hanya muncul untuk admin
  if (btnUsulkan) {
    if (currentUserRole === "admin") {
      btnUsulkan.style.display = "block";
    } else {
      btnUsulkan.style.display = "none";
    }
  }

  const infoHTML = `
        <div style="background: linear-gradient(135deg, #E0F2FE 0%, #DBEAFE 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 5px solid #1E3A8A;">
            <h3 style="color: #1E3A8A; margin: 0; font-size: 18px;">📋 Detail Riwayat untuk NIPEG: <strong>${selectedJabatan.nipeg}</strong></h3>
        </div>
    `;

  container.innerHTML =
    infoHTML + '<p style="text-align:center;">Loading detail...</p>';

  db.collection("pegawai")
    .doc(selectedJabatan.nipeg)
    .collection("detail_riwayat")
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        container.innerHTML =
          infoHTML +
          '<p style="text-align: center; color: #999;">Tidak ada detail riwayat</p>';
        return;
      }

      let tableHTML = `
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Prev.Per.no</th>
                                <th>Pers.No</th>
                                <th>Personnel Number</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Personnel Area</th>
                                <th>PSubarea</th>
                                <th>Personnel Subarea</th>
                                <th>Org.unit</th>
                                <th>Organizational Unit</th>
                                <th>Nama Panjang Posisi - SIMKP</th>
                                <th>Jenjang Main Grp - ID</th>
                                <th>Jenjang Sub Grp - Text</th>
                                <th>Jenjang Sub Grp - ID</th>
                                <th>Jenjang Main Grp - Text</th>
                                <th>BusA</th>
                                <th>Business Area</th>
                                <th>No SK Organizational Assignmen</th>
                                <th>Tanggal SK Organizational Assi</th>
                                <th>Kode Jabatan</th>
                                <th>Kelompok Jabatan</th>
                                <th>Keterangan Jabatan</th>
                                <th>Employee Group</th>
                                <th>Employee Subgroup</th>
                                <th>Org.unit</th>
                                <th>Organizational Unit</th>
                                <th>PArea</th>
                                <th>Payroll Area</th>
                                <th>Jenjang Sub Grp - ID</th>
                                <th>CoCd</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

      let no = 1;
      querySnapshot.forEach((doc) => {
        const data = doc.data();

        tableHTML += `
                    <tr>
                        <td>${no}</td>
                        <td>${selectedJabatan.nipeg}</td>
                        <td>${data.PersNo || "-"}</td>
                        <td>${data.PersonnelNumber || "-"}</td>
                        <td>${data.StartDate || "-"}</td>
                        <td>${data.EndDate || "-"}</td>
                        <td>${data.PersonnelArea || "-"}</td>
                        <td>${data.PSubarea || "-"}</td>
                        <td>${data.PersonnelSubarea || "-"}</td>
                        <td>${data.OrgUnit || "-"}</td>
                        <td>${data.OrganizationalUnit || "-"}</td>
                        <td>${data.NamaPanjangPosisiSIMKP || "-"}</td>
                        <td>${data.JenjangMainGrpID || "-"}</td>
                        <td>${data.JenjangSubGrpText || "-"}</td>
                        <td>${data.JenjangSubGrpID || "-"}</td>
                        <td>${data.JenjangMainGrpText || "-"}</td>
                        <td>${data.BusA || "-"}</td>
                        <td>${data.BusinessArea || "-"}</td>
                        <td>${data.NoSKOrganizationalAssignmen || "-"}</td>
                        <td>${data.TanggalSKOrganizationalAssi || "-"}</td>
                        <td>${data.KodeJabatan || "-"}</td>
                        <td>${data.KelompokJabatan || "-"}</td>
                        <td>${data.KeteranganJabatan || "-"}</td>
                        <td>${data.EmployeeGroup || "-"}</td>
                        <td>${data.EmployeeSubgroup || "-"}</td>
                        <td>${data.OrgUnit || "-"}</td>
                        <td>${data.OrganizationalUnit || "-"}</td>
                        <td>${data.PArea || "-"}</td>
                        <td>${data.PayrollArea || "-"}</td>
                        <td>${data.JenjangSubGrpID || "-"}</td>
                        <td>${data.CoCd || "-"}</td>
                    </tr>
                `;
        no++;
      });

      tableHTML += `
                        </tbody>
                    </table>
                </div>
            `;

      // ✅ Tambahkan pesan untuk user biasa di bawah tabel
      if (currentUserRole !== "admin") {
        tableHTML += `
                    <div style="background: #fff3cd; border: 2px solid #ffc107; padding: 15px; border-radius: 10px; margin-top: 20px; text-align: center;">
                        <strong>ℹ️ Info:</strong> Anda hanya dapat melihat detail pegawai. Untuk membuat usulan, hubungi administrator.
                    </div>
                `;
      }

      container.innerHTML = infoHTML + tableHTML;
    })
    .catch((error) => {
      console.error("Error loading detail_riwayat:", error);
      container.innerHTML =
        infoHTML +
        '<p style="color: red; text-align: center;">Error memuat detail riwayat</p>';
    });
}

// Event listener untuk tombol Usulkan
document.getElementById("btnUsulkan").addEventListener("click", function () {
  if (currentUserRole !== "admin") {
    alert("Anda tidak memiliki akses untuk membuat usulan!");
    return;
  }

  if (!selectedJabatan) {
    alert("Tidak ada jabatan yang dipilih!");
    return;
  }

  document.getElementById("detailJabatanSection").style.display = "none";
  document.getElementById("formUsulanSection").style.display = "block";
});

// Event listener untuk tombol Back
document
  .getElementById("btnBackToDetail")
  .addEventListener("click", function () {
    document.getElementById("detailJabatanSection").style.display = "block";
    document.getElementById("formUsulanSection").style.display = "none";
  });

// Event listener untuk form submit
document.getElementById("formUsulan").addEventListener("submit", function (e) {
  e.preventDefault();

  if (currentUserRole !== "admin") {
    alert("Anda tidak memiliki akses untuk membuat usulan!");
    return;
  }

  if (!selectedJabatan) {
    alert("Pilih jabatan dari halaman Jabatan Kosong terlebih dahulu!");
    return;
  }

  const jabatan = document.getElementById("jabatanUsulan").value;
  const nipegPegawai = document.getElementById("nipegPegawai").value;
  const namaPegawai = document.getElementById("namaPegawaiUsulan").value;
  const alasan = document.getElementById("alasanUsulan").value;
  const userNipeg = localStorage.getItem("NIPEG");

  db.collection("usulan")
    .add({
      Tanggal: firebase.firestore.FieldValue.serverTimestamp(),
      NIPEG_Jabatan: selectedJabatan.nipeg,
      Jabatan: jabatan,
      NIPEG_Pegawai_Diusulkan: nipegPegawai,
      Nama_Pegawai_Diusulkan: namaPegawai,
      Alasan: alasan,
      Status: "Pending",
      Diusulkan_Oleh: userNipeg,
      Diusulkan_Pada: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .then(() => {
      alert("Usulan berhasil dikirim!");
      document.getElementById("formUsulan").reset();
      selectedJabatan = null;
      switchPage("tabel-usulan");
    })
    .catch((error) => {
      console.error("Error saving usulan:", error);
      alert("Gagal menyimpan usulan: " + error.message);
    });
});

// Initialize menu navigation SEKALI saja
function initMenuNavigation() {
  document.querySelectorAll(".menu-item").forEach((item) => {
    item.addEventListener("click", function (e) {
      // Tombol Admin (keluar dari SPA)
      if (item.classList.contains("no-spa")) {
        return;
      }

      // Tombol lain pakai SPA
      e.preventDefault();

      // Update active state
      document
        .querySelectorAll(".menu-item")
        .forEach((m) => m.classList.remove("active"));
      item.classList.add("active");

      const pageName = item.getAttribute("data-page");
      switchPage(pageName);
    });
  });
}

// Switch between pages (tanpa event listener di dalamnya)
function switchPage(pageName) {
  // Hide all pages
  document.querySelectorAll(".page-content").forEach((page) => {
    page.classList.add("hidden");
  });

  // Show selected page
  const selectedPage = document.getElementById(`page-${pageName}`);
  if (selectedPage) {
    selectedPage.classList.remove("hidden");
  }

  // Update page title
  const titles = {
    "jabatan-kosong": "Jabatan Kosong",
    usulan: "Usulan",
    "tabel-usulan": "Tabel Usulan",
  };
  document.getElementById("pageTitle").textContent = titles[pageName] || "Home";

  // Load data if needed
  if (pageName === "tabel-usulan") {
    loadTabelUsulan();
  }

  // ✅ Pesan di halaman usulan (kalau belum ada jabatan dipilih)
  if (pageName === "usulan" && !selectedJabatan) {
    document.getElementById("detailJabatanSection").style.display = "none";
    document.getElementById("formUsulanSection").style.display = "none";
    document.getElementById("usulanEmptyMessage").style.display = "block";
    document.getElementById("usulanNoAccessMessage").style.display = "none";
  }
}

// Load tabel usulan dengan button Edit & Hapus (hanya untuk admin)
function loadTabelUsulan() {
  const tbody = document.querySelector("#tabelUsulan tbody");
  if (!tbody) return;

  tbody.innerHTML =
    '<tr><td colspan="6" style="text-align: center;">Loading...</td></tr>';

  db.collection("usulan")
    .orderBy("Tanggal", "desc")
    .get()
    .then((querySnapshot) => {
      tbody.innerHTML = "";

      if (querySnapshot.empty) {
        tbody.innerHTML =
          '<tr><td colspan="6" style="text-align: center;">Belum ada usulan</td></tr>';
        return;
      }

      let no = 1;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const docId = doc.id;

        let tanggal = "-";
        if (data.Tanggal && data.Tanggal.toDate) {
          tanggal = data.Tanggal.toDate().toLocaleDateString("id-ID");
        }

        const namaJabatan = data.Jabatan || "-";

        // Button aksi berdasarkan role
        let aksiButtons = `
                    <button class="action-btn btn-lihat btn-lihat-usulan" data-doc-id="${docId}">Lihat</button>
                `;

        if (currentUserRole === "admin") {
          aksiButtons += `
                        <button class="action-btn btn-edit" data-doc-id="${docId}">Edit</button>
                        <button class="action-btn btn-delete" data-doc-id="${docId}">Hapus</button>
                    `;
        }

        const row = document.createElement("tr");
        row.innerHTML = `
                    <td>${no}</td>
                    <td>${tanggal}</td>
                    <td>${namaJabatan}</td>
                    <td>${data.Nama_Pegawai_Diusulkan || "-"}</td>
                    <td>
                        ${
                          currentUserRole === "admin"
                            ? `
                        <select class="status-dropdown" data-doc-id="${docId}" style="padding: 8px 12px; border-radius: 5px; border: 1px solid #ccc; font-size: 14px; cursor: pointer; width: 100%;">
                            <option value="Pending" ${data.Status === "Pending" ? "selected" : ""}>🟡 Pending</option>
                            <option value="Disetujui" ${data.Status === "Disetujui" ? "selected" : ""}>✅ Disetujui</option>
                            <option value="Ditolak" ${data.Status === "Ditolak" ? "selected" : ""}>❌ Ditolak</option>
                        </select>
                        `
                            : `<span>${data.Status || "-"}</span>`
                        }
                    </td>
                    <td style="white-space: nowrap;">
                        ${aksiButtons}
                    </td>
                `;

        tbody.appendChild(row);
        no++;
      });

      attachUsulanEventListeners();
    })
    .catch((error) => {
      console.error("Error loading usulan:", error);
      tbody.innerHTML =
        '<tr><td colspan="6" style="text-align: center; color: red;">Error loading data</td></tr>';
    });
}

// Attach event listeners untuk dropdown dan tombol di tabel usulan
function attachUsulanEventListeners() {
  // Dropdown status (hanya admin)
  if (currentUserRole === "admin") {
    document.querySelectorAll(".status-dropdown").forEach((dropdown) => {
      dropdown.addEventListener("change", function () {
        const docId = this.getAttribute("data-doc-id");
        const newStatus = this.value;
        updateUsulanStatus(docId, newStatus);
      });
    });

    // Button Edit (hanya admin)
    document.querySelectorAll(".btn-edit").forEach((button) => {
      button.addEventListener("click", function () {
        const docId = this.getAttribute("data-doc-id");
        editUsulan(docId);
      });
    });

    // Button Hapus (hanya admin)
    document.querySelectorAll(".btn-delete").forEach((button) => {
      button.addEventListener("click", function () {
        const docId = this.getAttribute("data-doc-id");
        deleteUsulan(docId);
      });
    });
  }

  // Button Lihat (semua user)
  document.querySelectorAll(".btn-lihat-usulan").forEach((button) => {
    button.addEventListener("click", function () {
      const docId = this.getAttribute("data-doc-id");
      showDetailUsulan(docId);
    });
  });
}

// Update status usulan (admin only)
function updateUsulanStatus(docId, newStatus) {
  if (currentUserRole !== "admin") {
    alert("Anda tidak memiliki akses untuk mengubah status!");
    return;
  }

  if (!confirm(`Ubah status menjadi "${newStatus}"?`)) {
    loadTabelUsulan();
    return;
  }

  db.collection("usulan")
    .doc(docId)
    .update({
      Status: newStatus,
      Status_Diubah_Pada: firebase.firestore.FieldValue.serverTimestamp(),
      Diubah_Oleh: localStorage.getItem("NIPEG"),
    })
    .then(() => {
      alert("Status berhasil diubah!");
      loadTabelUsulan();
    })
    .catch((error) => {
      console.error("Error updating status:", error);
      alert("Gagal mengubah status: " + error.message);
      loadTabelUsulan();
    });
}

// Edit usulan (admin only)
function editUsulan(docId) {
  if (currentUserRole !== "admin") {
    alert("Anda tidak memiliki akses untuk mengedit usulan!");
    return;
  }

  db.collection("usulan")
    .doc(docId)
    .get()
    .then((doc) => {
      if (doc.exists) {
        const data = doc.data();

        // Prompt untuk edit
        const newJabatan = prompt("Edit Jabatan:", data.Jabatan);
        if (newJabatan === null) return; // User cancel

        const newNIPEG = prompt(
          "Edit NIPEG Pegawai:",
          data.NIPEG_Pegawai_Diusulkan,
        );
        if (newNIPEG === null) return;

        const newNama = prompt(
          "Edit Nama Pegawai:",
          data.Nama_Pegawai_Diusulkan,
        );
        if (newNama === null) return;

        const newAlasan = prompt("Edit Alasan:", data.Alasan);
        if (newAlasan === null) return;

        // Update ke Firestore
        db.collection("usulan")
          .doc(docId)
          .update({
            Jabatan: newJabatan,
            NIPEG_Pegawai_Diusulkan: newNIPEG,
            Nama_Pegawai_Diusulkan: newNama,
            Alasan: newAlasan,
            Diedit_Pada: firebase.firestore.FieldValue.serverTimestamp(),
            Diedit_Oleh: localStorage.getItem("NIPEG"),
          })
          .then(() => {
            alert("Usulan berhasil diupdate!");
            loadTabelUsulan();
          })
          .catch((error) => {
            console.error("Error updating usulan:", error);
            alert("Gagal mengupdate usulan: " + error.message);
          });
      }
    })
    .catch((error) => {
      console.error("Error loading usulan:", error);
      alert("Gagal memuat data usulan: " + error.message);
    });
}

// Delete usulan (admin only)
function deleteUsulan(docId) {
  if (currentUserRole !== "admin") {
    alert("Anda tidak memiliki akses untuk menghapus usulan!");
    return;
  }

  if (
    !confirm(
      "Apakah Anda yakin ingin menghapus usulan ini? Tindakan ini tidak dapat dibatalkan!",
    )
  ) {
    return;
  }

  db.collection("usulan")
    .doc(docId)
    .delete()
    .then(() => {
      alert("Usulan berhasil dihapus!");
      loadTabelUsulan();
    })
    .catch((error) => {
      console.error("Error deleting usulan:", error);
      alert("Gagal menghapus usulan: " + error.message);
    });
}

// Show detail usulan
function showDetailUsulan(docId) {
  db.collection("usulan")
    .doc(docId)
    .get()
    .then((doc) => {
      if (doc.exists) {
        const data = doc.data();
        let detailText = `Detail Usulan:\n\n`;
        detailText += `Jabatan: ${data.Jabatan || "-"}\n`;
        detailText += `NIPEG Pegawai: ${data.NIPEG_Pegawai_Diusulkan || "-"}\n`;
        detailText += `Nama Pegawai: ${data.Nama_Pegawai_Diusulkan || "-"}\n`;
        detailText += `Alasan: ${data.Alasan || "-"}\n`;
        detailText += `Status: ${data.Status || "-"}\n`;
        detailText += `Diusulkan Oleh: ${data.Diusulkan_Oleh || "-"}`;
        alert(detailText);
      } else {
        alert("Data usulan tidak ditemukan");
      }
    })
    .catch((error) => {
      console.error("Error loading detail usulan:", error);
      alert("Gagal memuat detail: " + error.message);
    });
}

// Logout
document.getElementById("btnLogout").addEventListener("click", function () {
  if (confirm("Yakin ingin logout?")) {
    auth
      .signOut()
      .then(() => {
        localStorage.removeItem("NIPEG");
        localStorage.removeItem("isLoggedIn");
        window.location.href = "login.html";
      })
      .catch((error) => {
        console.error("Error logout:", error);
        alert("Gagal logout: " + error.message);
      });
  }
});

// Search functionality
const searchInput = document.querySelector("#searchJabatan");
const searchBtn = document.querySelector(".btn-search");

if (searchBtn) {
  searchBtn.addEventListener("click", performSearch);
}

if (searchInput) {
  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      performSearch();
    }
  });
}

function performSearch() {
  if (!searchInput) return;
  const keyword = searchInput.value.toLowerCase();
  const rows = document.querySelectorAll("#tabelJabatanKosong tbody tr");

  rows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    if (text.includes(keyword)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

console.log("Home page loaded successfully with RBAC");
