auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const nipeg = localStorage.getItem("NIPEG");
  console.log("NIPEG dari localStorage:", nipeg);

  const admin = await isAdmin(nipeg);
  console.log("HASIL isAdmin:", admin);

  if (admin === true) {
    showMainContent();
  } else {
    showAccessDenied();
  }
});


function showAccessDenied() {
  document.getElementById("loadingScreen").style.cssText = "display:none !important;";
  document.getElementById("accessDenied").style.cssText = "display:flex !important;";
  document.getElementById("mainContent").style.cssText = "display:none !important;";
}

function showMainContent() {
  document.getElementById("loadingScreen").style.cssText = "display:none !important;";
  document.getElementById("accessDenied").style.cssText = "display:none !important;";
  // ✅ TAMBAHKAN SEMUA PROPERTY UNTUK CENTER
  document.getElementById("mainContent").style.cssText = "display:flex !important; justify-content:center !important; align-items:center !important; min-height:100vh !important; padding:40px 20px !important;";
}



// ===============================
// AMBIL SEMUA INPUT FORM
// ===============================

// DOC ID & NIPEG — harus sama persis dengan HTML
const docIdInput = document.getElementById("docId");
const nipegInput = document.getElementById("nipeg");

// SEMUA FIELD DETAIL
const inputs = {
  PersNo: document.getElementById("PersNo"),
  PersonnelNumber: document.getElementById("PersonnelNumber"),
  StartDate: document.getElementById("StartDate"),
  EndDate: document.getElementById("EndDate"),
  PersonnelArea: document.getElementById("PersonnelArea"),
  PSubarea: document.getElementById("PSubarea"),
  PersonnelSubarea: document.getElementById("PersonnelSubarea"),
  OrgUnit: document.getElementById("OrgUnit"),
  OrganizationalUnit: document.getElementById("OrganizationalUnit"),
  NamaPanjangPosisi: document.getElementById("NamaPanjangPosisiSIMKP"),
  JenjangMainGrpID: document.getElementById("JenjangMainGrpID"),
  JenjangSubGrpText: document.getElementById("JenjangSubGrpText"),
  JenjangSubGrpID: document.getElementById("JenjangSubGrpID"),
  JenjangMainGrpText: document.getElementById("JenjangMainGrpText"),
  BusA: document.getElementById("BusA"),
  BusinessArea: document.getElementById("BusinessArea"),
  NoSKOrganizationalAssignmen: document.getElementById(
    "NoSKOrganizationalAssignmen",
  ),
  TanggalSKOrganizationalAssi: document.getElementById(
    "TanggalSKOrganizationalAssi",
  ),
  KodeJabatan: document.getElementById("KodeJabatan"),
  KelompokJabatan: document.getElementById("KelompokJabatan"),
  KeteranganJabatan: document.getElementById("KeteranganJabatan"),
  EmployeeGroup: document.getElementById("EmployeeGroup"),
  EmployeeSubgroup: document.getElementById("EmployeeSubgroup"),
  PArea: document.getElementById("PArea"),
  PayrollArea: document.getElementById("PayrollArea"),
  CoCd: document.getElementById("CoCd"),
};

// ===============================
// BERSIHKAN FORM
// ===============================
function clearForm() {
  Object.values(inputs).forEach((input) => {
    if (input) input.value = "";
  });
}

// ===============================
// KUMPULKAN DATA
// ===============================
function getFormData() {
  const data = {};
  for (const key in inputs) {
    data[key] = inputs[key].value || "";
  }
  return data;
}

// ===============================
// SIMPAN DETAIL RIWAYAT
// ===============================
async function saveDetailRiwayat(addMore = false) {
  const docId = docIdInput.value.trim();
  const nipeg = nipegInput.value.trim();

  if (!docId) {
    alert("Masukkan Document ID!");
    return;
  }

  if (!nipeg) {
    alert("Masukkan NIPEG Pegawai!");
    return;
  }

  const data = getFormData();

  try {
    await db
      .collection("pegawai")
      .doc(nipeg)
      .collection("detail_riwayat")
      .doc(docId)
      .set(data);

    alert("Detail riwayat berhasil disimpan!");

    if (addMore) {
      clearForm();
      docIdInput.value = "";
    } else {
      window.location.href = "home.html";
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Gagal menyimpan riwayat.");
  }
}

// ===============================
// EVENT BUTTON
// ===============================
document
  .getElementById("btnSaveOnly")
  .addEventListener("click", () => saveDetailRiwayat(false));

document
  .getElementById("btnSaveMore")
  .addEventListener("click", () => saveDetailRiwayat(true));