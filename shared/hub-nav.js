/* =========================================================================
   hub-nav.js — สคริปต์ร่วมของ Knowledge Hub
   หน้าที่เดียว: แปะปุ่มลอย "← คลังความรู้" ไว้มุมซ้ายล่างของทุกเว็บย่อย
   เพื่อกลับหน้า hub กลาง โดยไม่แตะ DOM/CSS เดิมของเว็บนั้นเลย
   วิธีใช้: <script src="../shared/hub-nav.js"></script> ใน <head>

   หมายเหตุเรื่อง localStorage: เว็บย่อยแยก key กันอยู่แล้ว
   (cybersec_theme / osi_theme / theme) จึงไม่ต้องทำอะไรเพิ่ม
   ========================================================================= */
(function () {
  'use strict';

  function mount() {
    if (document.getElementById('hub-back')) return;

    var a = document.createElement('a');
    a.id = 'hub-back';
    a.href = '../index.html';
    a.title = 'กลับไปหน้าคลังความรู้';
    a.innerHTML = '<span aria-hidden="true">←</span><span>คลังความรู้</span>';
    document.body.appendChild(a);

    var css = document.createElement('style');
    css.textContent = [
      '#hub-back{position:fixed;left:14px;bottom:14px;z-index:99999;',
      'display:inline-flex;align-items:center;gap:.45rem;',
      'padding:.5rem .85rem;border-radius:999px;',
      'font:600 .82rem/1 "Noto Sans Thai",system-ui,sans-serif;',
      'text-decoration:none;color:#0b1020;background:#e8c979;',
      'border:1px solid rgba(0,0,0,.15);',
      'box-shadow:0 6px 20px rgba(0,0,0,.28);',
      'opacity:.55;transition:opacity .18s ease,transform .18s ease}',
      '#hub-back:hover,#hub-back:focus-visible{opacity:1;transform:translateY(-2px)}',
      '@media print{#hub-back{display:none}}'
    ].join('');
    document.head.appendChild(css);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
