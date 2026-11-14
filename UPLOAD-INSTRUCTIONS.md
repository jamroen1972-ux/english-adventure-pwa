# วิธีนำ Word Jump ป.3–ป.6 ขึ้น GitHub

1. แตกไฟล์ ZIP นี้
2. เปิด repo `english-adventure-pwa` ของคุณ
3. นำ `index.html`, `app.js`, `sw.js` ในชุดนี้ไปแทนไฟล์เดิมที่อยู่ระดับบนสุดของ repo
4. เพิ่มโฟลเดอร์ `word-jump-grades-3-6` ทั้งโฟลเดอร์ไว้ระดับบนสุด โดยต้องมี `index.html`, `three.min.js`, `LICENSE-THREE.txt` และ `README.md`
5. บันทึกไฟล์ใน GitHub แล้วรอ GitHub Pages อัปเดต

อย่าลบหรือแทนที่ `animal-words.html` เดิม เกม Animal Words สำหรับชั้นต้นยังอยู่เหมือนเดิม เกมใหม่จะแสดงในหน้า “บทเรียน” สำหรับโปรไฟล์ ป.3–ป.6

## ในชุดนี้มีอะไรบ้าง

- `index.html`, `app.js`, `sw.js`: ปุ่มเปิด Word Jump จากบทเรียนและแคชไฟล์เกม
- `word-jump-grades-3-6/index.html`: ตัวเกมและหมวดคำศัพท์ ป.3–ป.6
- `word-jump-grades-3-6/three.min.js`: ไลบรารี Three.js r128 ในเครื่อง สำหรับภาพ 3D
- `word-jump-grades-3-6/LICENSE-THREE.txt`: ใบอนุญาต MIT ของ Three.js
- `word-jump-grades-3-6/README.md`: คู่มือเกม

เกมจะเปิดจาก GitHub Pages ได้ และไฟล์ Three.js ถูกเก็บในชุดนี้เพื่อให้ service worker แคชไว้ใช้ต่อเมื่อเปิดแอปออนไลน์ครั้งแรกแล้ว

