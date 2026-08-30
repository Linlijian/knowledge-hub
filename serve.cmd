@echo off
REM เปิดคลังความรู้ผ่านเว็บเซิร์ฟเวอร์ (จำเป็นสำหรับหัวข้อ Treasury ที่ใช้ fetch)
cd /d "%~dp0"
start "" http://localhost:8000/
python -m http.server 8000
