// ===== RBAC Protection =====
auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const nipeg = localStorage.getItem("NIPEG");

  if (!nipeg || !isAdmin(nipeg)) {
    document.getElementById("loadingScreen").style.display = "none";
    document.getElementById("accessDenied").style.display = "block";
    document.getElementById("mainContent").style.display = "none";
  } else {
    document.getElementById("loadingScreen").style.display = "none";
    document.getElementById("accessDenied").style.display = "none";
    document.getElementById("mainContent").style.display = "block";

    loadPegawaiData();
  }
});

// ===== Form Submit - Add Pegawai =====
document.getElementById("formPegawai").addEventListener("submit", function (e) {
  e.preventDefault();

  const nipeg = localStorage.getItem("NIPEG");
  if (!isAdmin(nipeg)) {
    alert("Access Denied!");
    return;
  }

  const data = {
    PersNo: document.getElementById("PersNo").value,
    PersonnelNumber: document.getElementById("PersonnelNumber").value,
    NamaPanjangPosisi: document.getElementById("NamaPanjangPosisi").value,
    NamaPendekPosisiAtasan: document.getElementById("NamaPendekPosisiAtasan")
      .value,
    NamaPanjangPosisiSIMKP: document.getElementById("NamaPanjangPosisiSIMKP")
      .value,
    PersonnelNumberAtasan: document.getElementById("PersonnelNumberAtasan")
      .value,
    NIPEGAtasan: document.getElementById("NIPEGAtasan").value,
    NamaAtasan: document.getElementById("NamaAtasan").value,
    TelephoneNo: document.getElementById("TelephoneNo").value,
    Email: document.getElementById("Email").value,
    BusinessArea: document.getElementById("BusinessArea").value,
    PersonnelSubarea: document.getElementById("PersonnelSubarea").value,
    TanggalGradeTerakhir: document.getElementById("TanggalGradeTerakhir").value,
    GenderKey: document.getElementById("GenderKey").value,
    Birthplace: document.getElementById("Birthplace").value,
    BirthDate: document.getElementById("BirthDate").value,
    PSgroup: document.getElementById("PSgroup").value,
    Lv: document.getElementById("Lv").value,
    JenjangMainGrpText: document.getElementById("JenjangMainGrpText").value,
    JenjangSubGrpText: document.getElementById("JenjangSubGrpText").value,
    OrganizationalUnit: document.getElementById("OrganizationalUnit").value,
    PendidikanTerakhir: document.getElementById("PendidikanTerakhir").value,
    MaritalStatusKey: document.getElementById("MaritalStatusKey").value,
    StreetandHouseNumber: document.getElementById("StreetandHouseNumber").value,
    City: document.getElementById("City").value,
    Position: document.getElementById("Position").value,
    CreatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    CreatedBy: nipeg,
  };

  const nipegValue = document.getElementById("nipeg").value;

  db.collection("pegawai")
    .doc(nipegValue)
    .set(data)
    .then(() => {
      alert("✅ Data pegawai berhasil ditambahkan!");
      document.getElementById("formPegawai").reset();
      loadPegawaiData();
    })
    .catch((err) => {
      alert("❌ Error: " + err.message);
      console.error(err);
    });
});

// ===== Load Data Pegawai =====
function loadPegawaiData() {
  const tbody = document.querySelector("#tabelPegawai tbody");
  tbody.innerHTML =
    "<tr><td colspan='10' style='text-align:center;'>Loading...</td></tr>";

  db.collection("pegawai")
    .get()
    .then((snapshot) => {
      tbody.innerHTML = "";

      snapshot.forEach((doc) => {
        const d = doc.data();

        const row = `
                    <tr>
                        <td>${doc.id}</td>
                        <td>${d.PersNo || "-"}</td>
                        <td>${d.PersonnelNumber || "-"}</td>
                        <td>${d.NamaPanjangPosisi || "-"}</td>
                        <td>${d.NamaPendekPosisiAtasan || "-"}</td>
                        <td>${d.NamaPanjangPosisiSIMKP || "-"}</td>
                        <td>${d.PersonnelNumberAtasan || "-"}</td>
                        <td>${d.NIPEGAtasan || "-"}</td>
                        <td>${d.NamaAtasan || "-"}</td>
                        <td>${d.TelephoneNo || "-"}</td>
                        <td>${d.Email || "-"}</td>
                        <td>${d.BusinessArea || "-"}</td>
                        <td>${d.PersonnelSubarea || "-"}</td>
                        <td>${d.TanggalGradeTerakhir || "-"}</td>
                        <td>${d.GenderKey || "-"}</td>
                        <td>${d.Birthplace || "-"}</td>
                        <td>${d.BirthDate || "-"}</td>
                        <td>${d.PSgroup || "-"}</td>
                        <td>${d.Lv || "-"}</td>
                        <td>${d.JenjangMainGrpText || "-"}</td>
                        <td>${d.JenjangSubGrpText || "-"}</td>
                        <td>${d.OrganizationalUnit || "-"}</td>
                        <td>${d.PendidikanTerakhir || "-"}</td>
                        <td>${d.MaritalStatusKey || "-"}</td>
                        <td>${d.StreetandHouseNumber || "-"}</td>
                        <td>${d.City || "-"}</td>
                        <td>${d.Position || "-"}</td>
                        <td><button class="btn-delete" onclick="deletePegawai('${doc.id}')">Hapus</button></td>
                    </tr>
                `;

        tbody.innerHTML += row;
      });
    });
}

// ===== Hapus Pegawai =====
function deletePegawai(id) {
  if (!confirm("Yakin hapus data?")) return;

  db.collection("pegawai")
    .doc(id)
    .delete()
    .then(() => {
      alert("Berhasil dihapus!");
      loadPegawaiData();
    });
}
