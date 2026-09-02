/* =========================================================================
   responsive-tables.js — ตัวช่วยทำให้ตารางอ่านได้บนมือถือ

   หน้าที่: ติด data-label ให้ทุก <td> โดยดึงข้อความจาก <th> ของคอลัมน์นั้น
   แล้วใส่คลาส .has-labels ที่ <table>

   ตัวสคริปต์ "ไม่เปลี่ยนหน้าตาอะไรเลยด้วยตัวเอง" — มันแค่เตรียมข้อมูลไว้ให้
   CSS ในบล็อก @media (max-width: 768px) ของแต่ละโปรเจกต์เอาไปเรนเดอร์
   เป็นการ์ดแบบ label/value ฉะนั้นบนจอ desktop ทุกอย่างเหมือนเดิมทุกประการ

   รองรับตารางที่ JS สร้างทีหลังด้วย MutationObserver
   ========================================================================= */
(function () {
  'use strict';

  function stampTable(table) {
    var heads = [].map.call(table.querySelectorAll('thead th'), function (th) {
      return th.textContent.trim();
    });
    // ไม่มีหัวตาราง → แปลงเป็นการ์ดไม่ได้ ปล่อยให้เลื่อนแนวนอนตามเดิม
    if (!heads.length) return;

    // มี colspan/rowspan เมื่อไหร่ การจับคู่คอลัมน์จะเพี้ยน — ข้ามไปเลยปลอดภัยกว่า
    if (table.querySelector('[colspan], [rowspan]')) return;

    var rows = table.querySelectorAll('tbody tr');
    // ยังไม่มีแถว (เช่นโดนเรียกตอน DOM ยังไม่ครบ) — ยังไม่ต้องติดคลาส
    // ปล่อยให้ตารางเลื่อนแนวนอนไปก่อน แล้วรอบถัดไปค่อยมาติดให้
    if (!rows.length) return;

    [].forEach.call(rows, function (tr) {
      [].forEach.call(tr.children, function (cell, i) {
        if (heads[i] && !cell.hasAttribute('data-label')) {
          cell.setAttribute('data-label', heads[i]);
        }
      });
    });
    table.classList.add('has-labels');
  }

  function stampAll(root) {
    [].forEach.call((root || document).querySelectorAll('table'), stampTable);
  }

  function init() {
    stampAll(document);

    // กวาดซ้ำตอนโหลดเสร็จสมบูรณ์ เผื่อรอบแรกมาเร็วกว่าที่ตารางจะพร้อม
    window.addEventListener('load', function () { stampAll(document); });

    // ตารางที่ถูกสร้างขึ้นภายหลังด้วย JS ก็ให้ติด label ให้อัตโนมัติ
    if (!window.MutationObserver) return;
    new MutationObserver(function (records) {
      records.forEach(function (rec) {
        [].forEach.call(rec.addedNodes, function (n) {
          if (n.nodeType !== 1) return;
          if (n.tagName === 'TABLE') stampTable(n);
          else if (n.querySelector && n.querySelector('table')) stampAll(n);
        });
      });
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
