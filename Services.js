/* ====== بيانات المشتركين (مثال داخل الـ JS كـ array) ====== */
    const members = [
      {id:101, name:'عمر أحمد', age:9, level:1, days:['الاثنين','الخميس'], times:['16:00-17:00'], end:'2025-12-31'},
      {id:102, name:'سارة محمد', age:12, level:2, days:['السبت','الاحد'], times:['10:00-11:00'], end:'2026-01-10'},
      {id:103, name:'محمود علي', age:28, level:5, days:['الثلاثاء','الجمعة'], times:['19:00-20:00'], end:'2025-09-30'},
      {id:104, name:'هالة سمير', age:6, level:0, days:['الاربعاء'], times:['09:00-09:45'], end:'2025-11-15'},
      {id:105, name:' مالك محمد احمد', age:5, level:4, days:['الاحد والخميس'], times:['06:00-06:55'], end:'2025/11/27	الخميس'},
      {id:106, name:' اسر محمد عيد', age:7, level:4, days:['الاحد والخميس'], times:['05:00-05:55'], end:'2025/11/27	الخميس'},
      {id:107, name:' يحي محمد سعيد', age:6, level:4, days:['الاحد والخميس'], times:['04:00-04:55'], end:'2025/11/27	الخميس'},
      {id:108, name:' زين خالد ابراهيم', age:5, level:3, days:['الاحد والخميس'], times:['04:00-04:55'], end:'2025/11/27	الخميس'}
    ];

    /* ====== مستويات مفصّلة (7 مستويات) ====== */
 const levels = [
  {id:1, title: 'جديد', desc:'الطفو على الفرونت والباك بمساعدة، مع إخراج الزفير من الأنف داخل الماء.'},
  {id:2, title: 'مبتدئ', desc:'أداء استارت الفرونت والباك دون أي مساعدة.'},
  {id:3, title:'متوسط',  desc:'بدء ضربات  الرجلين الفرونت والباك .'},
  {id:4,  title:'متقدم', desc:'تعلّم الكاتشات للفرونت والباك مع بداية تمارين العجلة داخل الماء.'},
  {id:5, title:'رياضي',  desc:'السباحة بالكاتشات (فرونت & باك) لمسافة 25 متر — جاهز لاختبار Star 1.'},
  {id:6, title:'محترف', desc:'السباحة حرة وباك لمسافة 50 متر مع التيرن، مع بداية تعليم رجلين البريست.'}
];

    // Render levels
    const levelsGrid = document.getElementById('levelsGrid');
    levels.forEach(l=>{
      const card = document.createElement('div');
      card.className = 'level-card';
      card.innerHTML = `<h3>Level ${l.id} - ${l.title}</h3><p>${l.desc}</p>`;
      levelsGrid.appendChild(card);
    });

    // Search logic
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const memberPanel = document.getElementById('memberPanel');
    const memberBox = document.getElementById('memberBox');
    const memberNotFound = document.getElementById('memberNotFound');

    function showMember(m){
      document.getElementById('m-name').textContent = m.name;
      document.getElementById('m-age').textContent = m.age + ' سنة';
      document.getElementById('m-level').textContent = 'Level ' + m.level;
      document.getElementById('m-days').textContent = m.days.join('، ');
      document.getElementById('m-times').textContent = m.times.join('، ');
      document.getElementById('m-end').textContent = m.end;
      memberNotFound.style.display = 'none';
      memberBox.style.display = 'block';
      memberPanel.style.display = 'block';
    }

    function showNotFound(){
      memberBox.style.display = 'none';
      memberNotFound.style.display = 'block';
      memberPanel.style.display = 'block';
    }

    function searchMember(){
      const q = searchInput.value.trim().toLowerCase();
      if(!q){ memberPanel.style.display='none'; return; }
      // search by name or id
      const found = members.find(m=> m.name.toLowerCase().includes(q) || String(m.id) === q);
      if(found) showMember(found); else showNotFound();
    }

    searchBtn.addEventListener('click', searchMember);
    searchInput.addEventListener('keyup', function(e){ if(e.key === 'Enter') searchMember(); });

    // Complaint form handling (confidential)
    const complaintForm = document.getElementById('complaintForm');
    const sendComplaint = document.getElementById('sendComplaint');
    const complaintMsg = document.getElementById('complaintMsg');

    sendComplaint.addEventListener('click', ()=>{
      const name = document.getElementById('complaintName').value.trim();
      const id = document.getElementById('complaintId').value.trim();
      const text = document.getElementById('complaintText').value.trim();
      if(!text){ alert('يرجى كتابة نص الشكوى.'); return; }

      // ==== IMPORTANT: This is a front-end demo. =====
      // في تطبيق حقيقي: تأكد من إرسال الشكوى عبر اتصال آمن (HTTPS) إلى السيرفر وتخزينها بشكل مشفر.
      // هنا سنحاكي السرية بطباعة مُشفّر (hash بسيط) في الكونسول مع عدم عرض النص.

      const pseudoHash = btoa(Date.now() + '|' + (id||'') + '|' + (name||''));
      console.log('CONFIDENTIAL_COMPLAINT_RECEIVED {hash:', pseudoHash, '}');

      // feedback to user (do not reveal the complaint content)
      complaintMsg.style.display = 'block';
      setTimeout(()=>{ complaintMsg.style.display='none'; }, 5000);

      // clear sensitive fields
      document.getElementById('complaintText').value = '';
      document.getElementById('complaintId').value = '';
      document.getElementById('complaintName').value = '';
    });

    // small enhancement: allow clicking a name from a (future) list - not displayed here
