 // بيانات المشتركين
     const members = [
   {
  id: 1010,
  name: ' ',
  age: 7,
  level: 4,
  times: ['5:00-5:55'],
  days: [
    'الثلاثاء 02/12/2025',
    'الأحد 07/12/2025',
    'الثلاثاء 09/12/2025',
    'الأحد 14/12/2025',
    'الثلاثاء 16/12/2025',
    'الأحد 21/12/2025',
    'الثلاثاء 23/12/2025',
    'الأحد 28/12/2025'
  ],
  end: '2025/12/28	 الأحد' 
},
 {
  id: 1020,
  name: ' يحيي محمد سعيد',
  age: 6,
  level: 4,
  times: ['4:00-4:55'],
  days: [
    'الثلاثاء 02/12/2025',
    'الأحد 07/12/2025',
    'الثلاثاء 09/12/2025*',
    'الأحد 14/12/2025',
    'الثلاثاء 16/12/2025',
    'الأحد 21/12/2025',
    'الثلاثاء 23/12/2025',
    'الأحد 28/12/2025'
  ],
  end: '2025/12/28	 الأحد' 
},
{
  id: 1030,
name:' زين خالد ابراهيم',
  age: 6,
  level: 4,
  times: ['4:00-4:55'],
  days: [
    'الثلاثاء 02/12/2025',
    'الأحد 07/12/2025',
    'الثلاثاء 09/12/2025',
    'الأحد 14/12/2025*',
    'الثلاثاء 16/12/2025',
    'الأحد 21/12/2025',
    'الثلاثاء 23/12/2025',
    'الأحد 28/12/2025'
  ],
  end: '2025/12/28	 الأحد' 
},
{
  id: 1040,
name:' مالك محمد احمد',
  age: 6,
  level: 4,
  times: ['6:00-6:55'],
  days: [
    'الثلاثاء 02/12/2025',
    'الأحد 07/12/2025',
    'الثلاثاء 09/12/2025*',
    'الأحد 14/12/2025',
    'الثلاثاء 16/12/2025',
    'الأحد 21/12/2025',
    'الثلاثاء 23/12/2025',
    'الأحد 28/12/2025'
  ],
  end: '2025/12/28	 الأحد' 
},
    { id: 102, name: 'سارة محمد', age: 12, level: 2, times: ['10:00-11:00'], days: ['السبت* 12/7/2025', 'الأحد 13/7/2025', 'الثلاثاء 15/7/2025', 'الخميس 17/7/2025', 'السبت 19/7/2025', 'الإثنين 21/7/2025', 'الأربعاء 23/7/2025', 'الجمعة 25/7/2025'], end: '2026-01-10' },
    { id: 103, name: 'محمود علي', age: 28, level: 5, times: ['19:00-20:00'], days: ['الأحد* 13/7/2025', 'الإثنين 14/7/2025', 'الثلاثاء 15/7/2025', 'الأربعاء 16/7/2025', 'الخميس 17/7/2025', 'الجمعة 18/7/2025', 'السبت 19/7/2025', 'الأحد 20/7/2025'], end: '2025-09-30' },
    { id: 104, name: 'هالة سمير', age: 6, level: 0, times: ['09:00-09:45'], days: ['الإثنين* 14/7/2025', 'الثلاثاء 15/7/2025', 'الأربعاء 16/7/2025', 'الخميس 17/7/2025', 'الجمعة 18/7/2025', 'السبت 19/7/2025', 'الأحد 20/7/2025', 'الإثنين 21/7/2025'], end: '2025-11-15' }
];

        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        const memberPanel = document.getElementById('memberPanel');

    function renderMemberTable(m) {
    const daysHTML = m.days.map(d => {
        if (d.includes('*')) { // أي يوم فيه علامة * يتحول للون الأحمر
            return `<li style="color:red;font-weight:600;">${d.replace('*','')}</li>`; // نشيل العلامة عند العرض
        } else {
            return `<li>${d}</li>`;
        }
    }).join('');

    memberPanel.innerHTML = `
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
        <h4>أيام التدريب</h4>
        <ol>${daysHTML}</ol>
    `;
    memberPanel.style.display = 'block';
}

function searchMember() {
    const q = searchInput.value.trim();

    // التحقق من أن الإدخال رقم
    if (!q || isNaN(q)) {
        memberPanel.innerHTML = '<p style="color:red;font-weight:600;">الرجاء إدخال رقم!</p>';
        memberPanel.style.display = 'block';
        searchInput.focus();
        return;
    }

    // البحث برقم المشترك فقط
    const found = members.find(m => String(m.id) === q);

    if (found) {
        renderMemberTable(found);
    } else {
        memberPanel.innerHTML = '<p style="color:red;font-weight:600;">لا يوجد مشترك مطابق.</p>';
        memberPanel.style.display = 'block';
    }
}

        searchBtn.addEventListener('click', searchMember);
        searchInput.addEventListener('keyup', e => { if (e.key === 'Enter') searchMember(); });

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



