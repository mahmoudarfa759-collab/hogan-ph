const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = 'HOGAN@Admin#2025';

const DATA_DIR = path.join(__dirname, 'data');
const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads');

// إنشاء المجلدات
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const PHOTOS_FILE = path.join(DATA_DIR, 'photos.json');

// ملفات افتراضية
if (!fs.existsSync(SETTINGS_FILE)) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify({
    logo: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=200&auto=format&fit=crop',
    heroBg: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop',
    primaryColor: '#e11d48',
    font: "'Poppins', sans-serif",
    whatsapp: '966500000000',
    instagram: 'hoganph',
    phone: '966500000000'
  }, null, 2));
}

if (!fs.existsSync(PHOTOS_FILE)) {
  fs.writeFileSync(PHOTOS_FILE, JSON.stringify([
    { id: 1, src: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000&auto=format&fit=crop', title: 'City Sunset', cat: 'Architecture' },
    { id: 2, src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop', title: 'Golden Beach', cat: 'Landscape' }
  ], null, 2));
}

// إعداد رفع الصور
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// قراءة وكتابة البيانات
const readSettings = () => JSON.parse(fs.readFileSync(SETTINGS_FILE));
const writeSettings = (s) => fs.writeFileSync(SETTINGS_FILE, JSON.stringify(s, null, 2));
const readPhotos = () => JSON.parse(fs.readFileSync(PHOTOS_FILE));
const writePhotos = (p) => fs.writeFileSync(PHOTOS_FILE, JSON.stringify(p, null, 2));

// ✅ API - تسجيل الدخول
app.post('/api/login', express.json(), (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) return res.json({ success: true });
  res.status(401).json({ success: false, error: 'Wrong password' });
});

// ✅ API - جلب كل الإعدادات
app.get('/api/settings', (req, res) => res.json(readSettings()));

// ✅ API - حفظ الإعدادات
app.put('/api/settings', express.json(), (req, res) => {
  const settings = req.body;
  writeSettings(settings);
  res.json({ success: true });
});

// ✅ API - جلب جميع الصور
app.get('/api/photos', (req, res) => res.json(readPhotos()));

// ✅ API - رفع صورة جديدة
app.post('/api/photos', upload.single('image'), (req, res) => {
  const photos = readPhotos();
  const newPhoto = {
    id: Date.now(),
    src: `/uploads/${req.file.filename}`,
    title: req.body.title || 'New Photo',
    cat: req.body.category || 'General'
  };
  photos.unshift(newPhoto);
  writePhotos(photos);
  res.json({ success: true, photo: newPhoto });
});

// ✅ API - حذف صورة
app.delete('/api/photos/:id', (req, res) => {
  let photos = readPhotos();
  const id = parseInt(req.params.id);
  const photo = photos.find(p => p.id === id);
  if (photo) {
    const filePath = path.join(__dirname, 'public', photo.src);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    photos = photos.filter(p => p.id !== id);
    writePhotos(photos);
    return res.json({ success: true });
  }
  res.status(404).json({ success: false });
});

// ✅ API - رفع اللوجو
app.post('/api/upload-logo', upload.single('logo'), (req, res) => {
  const settings = readSettings();
  settings.logo = `/uploads/${req.file.filename}`;
  writeSettings(settings);
  res.json({ success: true, logo: settings.logo });
});

// ✅ API - رفع الخلفية
app.post('/api/upload-bg', upload.single('bg'), (req, res) => {
  const settings = readSettings();
  settings.heroBg = `/uploads/${req.file.filename}`;
  writeSettings(settings);
  res.json({ success: true, heroBg: settings.heroBg });
});

// تشغيل الملفات الثابتة
app.use(express.static(path.join(__dirname, 'public')));

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`🚀 HOGAN Ph Server running at http://localhost:${PORT}`);
});