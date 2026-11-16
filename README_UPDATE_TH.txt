อัปเดตเมนูเสี่ยงโชคและแชททำนายฝัน

ไฟล์หน้าเว็บ ให้อัปโหลดทับหรือเพิ่มที่หน้าแรกของรีโป:
- index.html
- sw.js
- luck-main.webp, luck-record.webp, luck-draw.webp, luck-calc.webp, luck-dream.webp, luck-sources.webp

ไฟล์ Worker ให้อัปโหลดทับในโฟลเดอร์ backend-worker:
- backend-worker/index.js

หลังอัปเดต Worker ให้ตั้งค่า Secret ชื่อ GEMINI_API_KEY ด้วยกุญแจ Gemini ที่ยังใช้ได้ แล้ว Deploy Worker ใหม่ รุ่นค้นเว็บเริ่มต้นคือ gemini-2.5-flash; หากเปลี่ยนรุ่นให้ใช้รุ่นที่รองรับ Google Search grounding

อย่าใส่กุญแจ API ลงใน index.html, GitHub หรือข้อความแชท
