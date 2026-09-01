const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = 'HOGAN@Admin#2025';

// في Vercel، ممنوع الكتابة على القرص، عشان كده نخلي الملفات في الذاكرة مؤقتاً
let settings = {
  logo: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=200&auto=format&fit=crop',
  heroBg: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop',
  primaryColor: '#e11d48',
  font: "'Poppins', sans-serif",
  whatsapp: '966500000000',
  instagram: 'hoganph',
  phone: '966500000000'
};

let photos = [
  { id: 1, src: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000&auto=format&fit=crop', title: 'City Sunset', cat: 'Architecture' },
  { id: 2, src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop', title: 'Golden Beach', cat: 'Landscape' }
];

// إعداد رفع الصور (تخزين مؤقت في الذاكرة)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ API - تسجيل الدخول
app.post('/api/login', express.json(), (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) return res.json({ success: true });
  res.status(401).json({ success: false, error: 'Wrong password' });
});

// ✅ API - جلب الإعدادات
app.get('/api/settings', (req, res) => res.json(settings));

// ✅ API - حفظ الإعدادات (للتخزين المؤقت)
app.put('/api/settings', express.json(), (req, res) => {
  settings = req.body;
  res.json({ success: true });
});

// ✅ API - جلب الصور
app.get('/api/photos', (req, res) => res.json(photos));

// ✅ API - رفع صورة جديدة (تخزين مؤقت كـ Base64)
app.post('/api/photos', upload.single('image'), (req, res) => {
  const imageBase64 = req.file.buffer.toString('base64');
  const newPhoto = {
    id: Date.now(),
    src: `data:image/jpeg;base64,${imageBase64}`,
    title: req.body.title || 'New Photo',
    cat: req.body.category || 'General'
  };
  photos.unshift(newPhoto);
  res.json({ success: true, photo: newPhoto });
});

// ✅ API - حذف صورة
app.delete('/api/photos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  photos = photos.filter(p => p.id !== id);
  res.json({ success: true });
});

// ✅ API - رفع اللوجو (تخزين مؤقت)
app.post('/api/upload-logo', upload.single('logo'), (req, res) => {
  const imageBase64 = req.file.buffer.toString('base64');
  settings.logo = `data:image/jpeg;base64,${imageBase64}`;
  res.json({ success: true, logo: settings.logo });
});

// ✅ API - رفع الخلفية (تخزين مؤقت)
app.post('/api/upload-bg', upload.single('bg'), (req, res) => {
  const imageBase64 = req.file.buffer.toString('base64');
  settings.heroBg = `data:image/jpeg;base64,${imageBase64}`;
  res.json({ success: true, heroBg: settings.heroBg });
});

// ✅ تشغيل الصفحات الثابتة
app.use(express.static(path.join(__dirname, 'public')));

// ✅ التصدير لـ Vercel
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 HOGAN Ph Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
