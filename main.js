const App = {
  // جلب الأطباق من ذاكرة المتصفح
  dishes: JSON.parse(localStorage.getItem('vip_dishes')) || [],

  // --- تهيئة لوحة الإدارة ---
  initAdmin: function() {
    this.renderDishesAdmin();

    const addBtn = document.getElementById('addDish');
    if(addBtn) {
      // ربط زر الإضافة بالدالة
      addBtn.addEventListener('click', () => this.addDish());
    }

    const savePowrBtn = document.getElementById('savePowr');
    if(savePowrBtn) {
      document.getElementById('powrCode').value = localStorage.getItem('vip_powr') || '';
      savePowrBtn.addEventListener('click', () => {
        localStorage.setItem('vip_powr', document.getElementById('powrCode').value);
        alert('تم حفظ كود POWR بنجاح!');
      });
    }
  },

  // --- دالة إضافة الطبق (تم تحسينها لتفادي الأخطاء) ---
  addDish: function() {
    // 1. جلب العناصر بأمان
    const titleInput = document.getElementById('dishTitle');
    const categoryInput = document.getElementById('dishCategory');
    const descInput = document.getElementById('dishDesc');
    const imgUrlInput = document.getElementById('dishImgUrl');
    const imgFileInput = document.getElementById('dishImgFile');

    // التأكد من وجود حقل الاسم لتفادي توقف الكود
    if (!titleInput) {
      alert("عذراً، هناك خطأ في ربط حقل اسم الطبق.");
      return;
    }

    const title = titleInput.value;
    const category = categoryInput ? categoryInput.value : '';
    const desc = descInput ? descInput.value : '';
    const imgUrl = imgUrlInput ? imgUrlInput.value : '';
    const selectedFile = (imgFileInput && imgFileInput.files.length > 0) ? imgFileInput.files[0] : null;

    // 2. التحقق من إدخال الاسم
    if (!title.trim()) {
      alert('الرجاء إدخال اسم الطبق أولاً!');
      return;
    }

    // 3. دالة الحفظ النهائية
    const saveDishData = (finalImageSrc) => {
      const newDish = {
        id: Date.now(),
        title: title,
        category: category,
        desc: desc,
        imgUrl: finalImageSrc || 'https://via.placeholder.com/300?text=بدون+صورة'
      };

      this.dishes.push(newDish);

      try {
        // حفظ في الذاكرة
        localStorage.setItem('vip_dishes', JSON.stringify(this.dishes));
        
        // تفريغ الحقول بعد النجاح
        titleInput.value = '';
        if(categoryInput) categoryInput.value = '';
        if(descInput) descInput.value = '';
        if(imgUrlInput) imgUrlInput.value = '';
        if(imgFileInput) imgFileInput.value = '';

        // تحديث الواجهة ورسالة نجاح
        this.renderDishesAdmin();
        alert('تم إضافة الطبق بنجاح!');
      } catch (error) {
        alert('عذراً، مساحة التخزين ممتلئة بسبب حجم الصور.');
        this.dishes.pop();
      }
    };

    // 4. معالجة الصورة (سواء كانت ملف أو رابط)
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = function(event) {
        saveDishData(event.target.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      saveDishData(imgUrl);
    }
  },

  // --- دالة عرض الأطباق في اللوحة ---
  renderDishesAdmin: function() {
    const list = document.getElementById('dishesList');
    if(!list) return;
    list.innerHTML = ''; 

    this.dishes.forEach(dish => {
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        <img src="${dish.imgUrl}" alt="${dish.title}" style="height:150px; width:100%; object-fit:cover; border-radius:8px 8px 0 0;">
        <div style="padding: 15px;">
          <h5 style="margin: 0 0 8px; font-size: 1.1rem;">${dish.title}</h5>
          <p style="margin: 0; font-size: 0.85rem; color: #666;">${dish.desc}</p>
          <button onclick="App.deleteDish(${dish.id})" style="margin-top:12px; background:#dc3545; color:white; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; width:100%; font-weight:bold;">حذف الطبق</button>
        </div>
      `;
      list.appendChild(card);
    });
  },

  // --- دالة حذف الطبق ---
  deleteDish: function(id) {
    if(confirm('هل أنت متأكد من حذف هذا الطبق؟')) {
      this.dishes = this.dishes.filter(dish => dish.id !== id);
      localStorage.setItem('vip_dishes', JSON.stringify(this.dishes));
      this.renderDishesAdmin();
    }
  },

  // --- دالة العرض للزوار (في الصفحة الرئيسية) ---
  initViewer: function() {
    const localMenu = document.getElementById('local-menu');
    if(!localMenu) return;

    if(this.dishes.length === 0) {
      localMenu.innerHTML = '<p style="text-align:center; grid-column: 1 / -1;">لم يتم إضافة أطباق بعد.</p>';
      return;
    }

    localMenu.innerHTML = '';
    this.dishes.forEach(dish => {
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        <img src="${dish.imgUrl}" alt="${dish.title}" class="view-btn" data-img="${dish.imgUrl}" data-title="${dish.title}" data-desc="${dish.desc}" style="cursor:pointer;">
        <div class="item-body">
          <h4 class="item-title">${dish.title}</h4>
          <p class="item-desc">${dish.desc}</p>
        </div>
      `;
      localMenu.appendChild(card);
    });
  }
};

// تشغيل الأكواد تلقائياً بناءً على الصفحة الحالية
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('adminArea')) {
    App.initAdmin();
  } else {
    App.initViewer();
  }
});
