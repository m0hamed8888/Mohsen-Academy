const members = [
  { id: 1020, name: ' يحيي محمد سعيد', age: 6, level: 4, times: ['4:00-4:55'], end: 'الثلاثاء 2026/01/27' },
  { id: 1030, name: ' زين خالد ابراهيم', age: 6, level: '3+', times: ['4:00-4:55'], end: 'الثلاثاء 2026/01/27' },
  { id: 1040, name: ' مالك محمد احمد', age: 6, level: '+4', times: ['6:00-6:55'], end: 'الثلاثاء 2026/01/27' },
  { id: 2040, name: 'عبد الرحمن محمود فؤاد', age: 11, level: '+4', times: ['9:30-11:30'], end: 'الثلاثاء 2026/01/27' },
  { id: 20401, name: 'يوسف محمود فؤاد', age: 7, level: '+4', times: ['9:30-11:30'], end: 'الثلاثاء 2026/01/27' },
  { id: 20402, name: 'منصور محمود منصور',age: 8, level: '4', times: ['9:30-11:30'], end: 'الثلاثاء 2026/01/27' },
  { id: 20403, name: 'محمد محمود منصور', age: 5, level: '4', times: ['9:30-11:30'], end: 'الثلاثاء 2026/01/27' }


];
function getTotalSessionsById(id) {
  const idStart = String(id).substring(0, 2);

  if (idStart === "10") return 8;
  if (idStart === "20") return 1;

  return 8; // افتراضي
}

// دالة لتوليد الأيام حسب أيام محددة وعدد أسابيع
function generateMonthDays(startDate, daysOfWeek, totalSessions = 8) {
  const dayNames = ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
  const result = [];
  const start = new Date(startDate);

  let week = 0;

  while (result.length < totalSessions) {
    for (let d of daysOfWeek) {
      if (result.length >= totalSessions) break;

      const dayIndex = dayNames.indexOf(d);
      if (dayIndex === -1) continue;

      const date = new Date(start);
      const currentDay = date.getDay();
      let diff = dayIndex - currentDay;
      if (diff < 0) diff += 7;

      date.setDate(date.getDate() + diff + week * 7);

      const dayStr = `${d} ${date.getFullYear()}/${(date.getMonth()+1)
        .toString().padStart(2,'0')}/${date.getDate().toString().padStart(2,'0')}`;

      result.push(dayStr);
    }
    week++;
  }

  return result;
}


members.forEach(m => {
  const idStart = String(m.id).substring(0,2);
  let daysOfWeek = [];

  if (idStart === "10") {
    daysOfWeek = ["الأحد", "الثلاثاء", "الخميس"];
  } else if (idStart === "20") {
    daysOfWeek = ["السبت"];
  } else {
    daysOfWeek = ["الأحد", "الثلاثاء"];
  }

  const totalSessions = getTotalSessionsById(m.id);

  m.days = generateMonthDays("2026-02-01", daysOfWeek, totalSessions)
    .map(d => ({ date: d, isAbsent: false }));

  // ⭐ نهاية الاشتراك أوتوماتيك
  m.end = getEndDateFromDays(m.days);
});



function getEndDateFromDays(days) {
  if (!days || days.length === 0) return '';

  const lastDay = days[days.length - 1]; // آخر عنصر
  return lastDay.date; // "الثلاثاء 2026/02/24"
}

// OLDServices.js -> updated JS

// ======= Modern Modal JS =======
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const memberModal = document.getElementById('memberModal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');

function renderMemberModal(m) {
    const daysHTML = m.days.map(d=>{
        return `<li style="color:${d.isAbsent?'red':'#333'}">${d.date}</li>`;
    }).join('');

    modalBody.innerHTML = `
        <h3>بيانات المشترك</h3>
        <table>
          <tr>
            <th>الرقم</th>
            <th>الاسم</th>
            <th>العمر</th>
            <th>المستوى</th>
            <th>عدد الحصص</th>
            <th>ساعه التدريب</th>
            <th>نهايه الاشتراك</th>
          </tr>
          <tr>
            <td>${m.id}</td>
            <td>${m.name}</td>
            <td>${m.age}</td>
            <td>${m.level}</td>
            <td>${m.days.length}</td>
            <td>${m.times.join('، ')}</td>
            <td>${m.end}</td>
          </tr>
        </table>
        <h4 style="text-align:center; margin-bottom:10px;">أيام التدريب</h4>
        <ol>${daysHTML}</ol>
    `;
    memberModal.style.display = 'flex';
}

// اغلاق المودال
modalClose.addEventListener('click', ()=>memberModal.style.display='none');
memberModal.addEventListener('click', e=>{ if(e.target===memberModal) memberModal.style.display='none'; });

// البحث
function searchMember() {
    const q = searchInput.value.trim();
    if(!q || isNaN(q)){
        modalBody.innerHTML = '<p style="color:red; text-align:center; font-weight:700;">الرجاء إدخال رقم!</p>';
        memberModal.style.display='flex';
        searchInput.focus();
        return;
    }
    const found = members.find(m=>String(m.id)===q);
    if(found) renderMemberModal(found);
    else {
        modalBody.innerHTML = '<p style="color:red; text-align:center; font-weight:700;">لا يوجد مشترك مطابق.</p>';
        memberModal.style.display='flex';
    }
}

searchBtn.addEventListener('click', searchMember);
searchInput.addEventListener('keyup', e=>{ if(e.key==='Enter') searchMember(); });
// مثال لتعديل الغياب:
// العضو 1010 غائب يوم "الأحد 2026/01/03"
const member = members.find(m => m.id === 1010);
const day = member.days.find(d => d.date === "الأحد 2026/01/03");
if(day) day.isAbsent = true;

// 1️⃣ تعديل حالة الغياب
function setAbsent(memberId, dateStr, absent = true) {
  const member = members.find(m => m.id === memberId);
  if(!member) return false;

  const day = member.days.find(d => d.date === dateStr);
  if(!day) return false;

  day.isAbsent = absent; // true → غائب، false → حاضر
  return true;
}


// إضافة يوم جديد مع الحفاظ على الترتيب الزمني
function addDaySorted(memberId, dayName, dateStr, absent = false) {
  const member = members.find(m => m.id === memberId);
  if (!member) return false;

  // نحول التاريخ لصيغة JS Date للمقارنة
  const newDate = new Date(dateStr);

  // نضيف اليوم الجديد
  member.days.push({
    date: `${dayName} ${dateStr}`,
    isAbsent: absent
  });

  // نرتب المصفوفة حسب التاريخ
  member.days.sort((a, b) => {
    const aDate = new Date(a.date.split(' ')[1]); // ناخد التاريخ فقط
    const bDate = new Date(b.date.split(' ')[1]);
    return aDate - bDate;
  });

  return true;
}

// إضافة يوم   ******************************************************************************** 
// addDaySorted(2040, "الجمعة", "2026/01/01", false);

// addDaySorted(1020, "الخميس", "2026/01/15", false);
// addDaySorted(1020, "الخميس", "2026/01/29", false);

// addDaySorted(1030, "الخميس", "2026/01/15", false);

// addDaySorted(1040, "الخميس", "2026/01/15", false);
// addDaySorted(1040, "الخميس", "2026/01/29", false);

//      تسجيل الغياب **********************************************************************************
// setAbsent(1080, "الثلاثاء 2026/01/06", true);

// setAbsent(1010, "الأحد 2026/01/04", true);

// setAbsent(1010, "الأحد 2026/01/25", true);


// setAbsent(1020, "الأحد 2026/01/04", true);
// setAbsent(1020, "الثلاثاء 2026/01/06", true);
// setAbsent(1020, "الثلاثاء 2026/01/13", true);

// setAbsent(1030, "الثلاثاء 2026/01/13", true);
// setAbsent(1030, "الخميس 2026/01/15", true);

// setAbsent(1040, "الثلاثاء 2026/01/13", true);
// setAbsent(1040, "الأحد 2026/01/04", true);
// setAbsent(1040, "الخميس 2026/01/15", true);
// setAbsent(1040, "الثلاثاء 2026/01/27", true);



        // المستويات
        const levels = [
            { id: 1, title: 'جديد', desc: 'الطفو على الفرونت والباك بمساعدة، مع إخراج الزفير من الأنف داخل الماء.' },
            { id: 2, title: 'مبتدئ', desc: 'أداء استارت الفرونت والباك دون أي مساعدة.' },
            { id: 3, title: 'متوسط', desc: 'بدء ضربات الرجلين الفرونت والباك من الاستارت بدون مساعده' },
            { id: 4, title: 'متقدم', desc: 'تعلّم الكاتشات للفرونت والباك مع بداية تمارين العجلة داخل الماء.' },
            { id: 5, title: 'رياضي', desc: 'السباحة بالكاتشات (فرونت & باك) لمسافة 25 متر — جاهز لاختبار Star 1.' },
            { id: 6, title: 'محترف', desc: 'السباحة حرة وباك لمسافة 50 متر مع التيرن، مع بداية تعليم رجلين البريست و الدولفين.' },
            { id: 7, title: 'خبير', desc: ' تعليم سباحه الدولفين و الدريلات الخاصه بها و ايضا  البريست و الدريلات الخاصه بها ' }
        ];

        const levelsGrid = document.getElementById('levelsGrid');
        levels.forEach(l => {
            const card = document.createElement('div');
            card.className = 'level-card';
            card.innerHTML = `<h3>Level ${l.id} - ${l.title}</h3><p>${l.desc}</p>`;
            levelsGrid.appendChild(card);
        });

            function toggleNavbar() {
    const navbarLinks = document.getElementById("navbarLinks");
    const toggleIcon = document.getElementById("navbarToggle");

    navbarLinks.classList.toggle("active");

    if (navbarLinks.classList.contains("active")) {
      toggleIcon.textContent = "✖";
    } else {
      toggleIcon.textContent = "☰";
    }
  }
  document.addEventListener("click", function (e) {
    const navbarLinks = document.getElementById("navbarLinks");
    const toggleIcon = document.getElementById("navbarToggle");

    if (
      navbarLinks.classList.contains("active") &&
      !navbarLinks.contains(e.target) &&
      !toggleIcon.contains(e.target)
    ) {
      navbarLinks.classList.remove("active");
      toggleIcon.textContent = "☰";
    }
  });
  document.addEventListener("DOMContentLoaded", () => {
    const lazyBG = document.querySelectorAll("[data-bg]");

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.style.backgroundImage = `url('${el.dataset.bg}')`;
          observer.unobserve(el);
        }
      });
    });

    lazyBG.forEach(el => observer.observe(el));
  });
