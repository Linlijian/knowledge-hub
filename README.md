# คลังความรู้ (Knowledge Hub)

หน้า landing กลางที่รวมเว็บติวสอบและคลังข้อสอบไว้ที่เดียว
แต่ละหัวข้อยังเป็นเว็บ static อิสระที่เปิดใช้งานเองได้ครบ

## หัวข้อ

| โฟลเดอร์ | เนื้อหา | หมายเหตุ |
|---|---|---|
| `cybersecurity/` | CIA Triad, threat actors, การโจมตีแมปกับ OSI, malware, social engineering, cryptography, defense | เปิดจากไฟล์ตรงๆ ได้ |
| `networking/` | OSI 7 layers, TCP/IP, encapsulation, อุปกรณ์, IPv4/IPv6/MAC, topology | เปิดจากไฟล์ตรงๆ ได้ |
| `treasury/` | คลังข้อสอบแยกหมวด พร้อมรูป สรุปคะแนน และโหมด Hardcore | **ต้องเปิดผ่านเซิร์ฟเวอร์** |

`treasury/` เป็น git repo แยกต่างหาก — [Linlijian/treasury-quiz](https://github.com/Linlijian/treasury-quiz)
repo นี้ ignore ไว้ ต้อง clone เพิ่มเองถ้าอยากได้ครบ:

```bash
git clone https://github.com/Linlijian/treasury-quiz.git treasury
```

## วิธีเปิด

หัวข้อ treasury โหลดข้อมูลด้วย `fetch()` จึงต้องเสิร์ฟผ่าน HTTP
ดับเบิลคลิก `serve.cmd` หรือ:

```bash
python -m http.server 8000
```

แล้วเปิด http://localhost:8000/

## โครงสร้างร่วม

- `index.html` — หน้า hub กลาง มีการ์ดเลือกหัวข้อและ toggle light/dark
- `shared/hub.css` — ธีมกลาง: พื้นเข้มเป็นกลาง แล้วให้แต่ละการ์ดยืมสีเอกลักษณ์ของเว็บย่อยมาเป็น accent
- `shared/hub-nav.js` — แปะปุ่มลอย "← คลังความรู้" ให้ทุกเว็บย่อย โดยไม่แตะ DOM/CSS เดิมของเว็บนั้น
