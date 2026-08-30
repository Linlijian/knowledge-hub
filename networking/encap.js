/* =========================================================================
   encap.js — ข้อมูลสถานการณ์จำลองการส่งข้อมูลจาก Computer A ไป Computer B
   ใช้ในหน้า Encapsulation & Decapsulation (บทที่ 3)

   เส้นทางที่จำลอง:  [Computer A] → [Switch] → [Router] → [Computer B]

   โครงสร้างของแต่ละขั้น (step):
     device : อุปกรณ์ที่กำลังทำงานอยู่ ใช้ไฮไลต์ในผังด้านบน (pcA / sw / rt / pcB)
     side   : 'A' = ฝั่งส่ง, 'B' = ฝั่งรับ, 'mid' = อุปกรณ์กลาง, 'wire' = อยู่บนสาย
     layer  : ชั้นที่กำลังทำงาน (0 = อยู่บนสื่อกลาง ไม่นับเป็นชั้นของโฮสต์)
     act    : add = ห่อเพิ่ม, strip = แกะออก, pass = ส่งผ่าน, rebuild = ห่อใหม่
     parts  : ชิ้นส่วนของก้อนข้อมูล ณ ขั้นนั้น (กล่องจะโตขึ้น/เล็กลงตามนี้)
     fields : รายละเอียดข้างใน header ที่เพิ่งถูกเพิ่มหรือกำลังถูกอ่าน
     wire   : ชื่อลิงก์ที่ให้จุดสัญญาณวิ่ง (link1 / link2 / link3)
   ========================================================================= */

/* ค่าคงที่ของสถานการณ์จำลอง — แก้ตรงนี้ที่เดียวก็เปลี่ยนได้ทั้งแอนิเมชัน */
const NET_SCENARIO = {
  pcA:      { name: "Computer A", ip: "192.168.1.10",  mac: "AA:BB:CC:00:11:01" },
  gateway:  { name: "Router (ขา LAN)", ip: "192.168.1.1", mac: "AA:BB:CC:00:11:FE" },
  routerWan:{ name: "Router (ขา WAN)", ip: "203.0.113.1", mac: "AA:BB:CC:00:22:FE" },
  pcB:      { name: "Computer B", ip: "203.0.113.25", mac: "DD:EE:FF:00:33:0B" }
};

/* ผังอุปกรณ์บนเส้นทาง ใช้วาดแถบด้านบนของแอนิเมชัน */
const NET_PATH = [
  { id: "pcA", label: "Computer A", sub: "192.168.1.10", icon: "💻", layer: 7 },
  { id: "sw",  label: "Switch",     sub: "ทำงานถึง Layer 2", icon: "🔀", layer: 2 },
  { id: "rt",  label: "Router",     sub: "ทำงานถึง Layer 3", icon: "🧭", layer: 3 },
  { id: "pcB", label: "Computer B", sub: "203.0.113.25", icon: "🖥️", layer: 7 }
];

/* ตารางสรุป PDU และสิ่งที่อยู่ข้างในแต่ละชั้น (แสดงท้ายบท) */
const PDU_INSIDE = [
  { layer: 7, pdu: "Data",    header: "ไม่มี header ของการขนส่ง", inside: "ข้อมูลดิบจากโปรแกรม เช่น คำสั่ง HTTP GET", addr: "ไม่ใช้ที่อยู่" },
  { layer: 6, pdu: "Data",    header: "ไม่มี",                    inside: "ข้อมูลที่ถูกแปลงรูปแบบ บีบอัด และเข้ารหัส TLS แล้ว", addr: "ไม่ใช้ที่อยู่" },
  { layer: 5, pdu: "Data",    header: "ไม่มี",                    inside: "ข้อมูลพร้อมข้อมูลกำกับเซสชันและ checkpoint", addr: "ไม่ใช้ที่อยู่" },
  { layer: 4, pdu: "Segment (TCP) / Datagram (UDP)", header: "TCP Header 20–60 ไบต์ หรือ UDP Header 8 ไบต์",
    inside: "Source Port, Destination Port, Checksum และถ้าเป็น TCP จะมี Sequence, ACK, Flags, Window เพิ่ม", addr: "Port Number" },
  { layer: 3, pdu: "Packet",  header: "IP Header",                inside: "Source IP, Destination IP, TTL, Protocol, Version", addr: "IP Address" },
  { layer: 2, pdu: "Frame",   header: "Ethernet Header + Trailer", inside: "Source MAC, Destination MAC, EtherType และ FCS ไว้ตรวจความถูกต้องท้ายเฟรม", addr: "MAC Address" },
  { layer: 1, pdu: "Bits",    header: "ไม่มี header",             inside: "สัญญาณไฟฟ้า แสง หรือคลื่นวิทยุที่แทนเลข 0 กับ 1", addr: "ไม่ใช้ที่อยู่" }
];

/* -------------------------------------------------------------------------
   ตัวสร้างขั้นตอนทั้งหมด — รับโหมด 'tcp' หรือ 'udp' แล้วคืน array ของ step
   แยกเป็นฟังก์ชันเพื่อให้ปุ่มสลับ TCP/UDP สร้างชุดขั้นตอนใหม่ได้ทันที
   ------------------------------------------------------------------------- */
function buildEncapSteps(mode) {
  const isTcp = mode === "tcp";
  const S = NET_SCENARIO;

  /* ชื่อและรายละเอียดของ header ชั้น 4 ต่างกันตามโหมดที่เลือก */
  const l4Name = isTcp ? "TCP Header" : "UDP Header";
  const l4Pdu  = isTcp ? "Segment" : "Datagram";
  const l4Port = isTcp ? "443 (HTTPS)" : "53 (DNS)";

  const l4Fields = isTcp
    ? {
        title: "TCP Header (20 ไบต์เป็นอย่างน้อย)",
        rows: [
          ["Source Port", "51514"],
          ["Destination Port", "443 (HTTPS)"],
          ["Sequence Number", "1,024,556"],
          ["Acknowledgment Number", "875,401"],
          ["Flags", "ACK, PSH"],
          ["Window Size", "64,240"],
          ["Checksum", "0x1A2B"]
        ]
      }
    : {
        title: "UDP Header (8 ไบต์คงที่)",
        rows: [
          ["Source Port", "51514"],
          ["Destination Port", "53 (DNS)"],
          ["Length", "512 ไบต์"],
          ["Checksum", "0x9F3C"]
        ]
      };

  const l4Desc = isTcp
    ? "Layer 4 ซอยข้อมูลเป็นชิ้นแล้วห่อเป็น Segment ใส่ Port ปลายทาง 443 พร้อม Sequence Number ไว้เรียงลำดับ และ ACK ไว้ยืนยันการรับ จึงมี header ใหญ่กว่า UDP"
    : "Layer 4 ห่อข้อมูลเป็น Datagram ใส่แค่ Port ต้นทาง–ปลายทาง ความยาว และ Checksum เท่านั้น ไม่มี Sequence ไม่มี ACK จึงเบากว่าและเร็วกว่า TCP";

  /* ชิ้นส่วนที่ใช้ซ้ำบ่อย ๆ */
  const pData  = { k: "data", t: "Data" };
  const pL4    = { k: "l4",   t: l4Name };
  const pL3    = { k: "l3",   t: "IP Header" };
  const pL2    = { k: "l2",   t: "MAC Header" };
  const pFcs   = { k: "l2",   t: "FCS" };
  const pBits  = { k: "bit",  t: "0101 1100 1011 0110 ..." };

  const frameA = [pL2, pL3, pL4, pData, pFcs];   // เฟรมที่ออกจากเครื่อง A
  const packet = [pL3, pL4, pData];              // เมื่อแกะเฟรมออกแล้ว
  const segment = [pL4, pData];

  return [
    /* ===== ฝั่งส่ง: Computer A ห่อข้อมูลลงมาทีละชั้น ===== */
    {
      device: "pcA", side: "A", layer: 7, act: "add", pdu: "Data",
      title: "Layer 7 — Application สร้างข้อมูล",
      desc: "ตอนนี้โปรแกรมกำลังสร้างข้อมูลที่ผู้ใช้ต้องการส่ง เช่น เบราว์เซอร์สร้างคำสั่ง HTTP GET /index.html ยังเป็นข้อมูลดิบล้วน ๆ ไม่มีอะไรห่ออยู่เลย",
      parts: [pData], fields: null
    },
    {
      device: "pcA", side: "A", layer: 6, act: "add", pdu: "Data",
      title: "Layer 6 — Presentation แปลงและเข้ารหัส",
      desc: "ตอนนี้ชั้น 6 กำลังแปลงข้อมูลเป็น UTF-8 บีบอัดให้เล็กลง แล้วเข้ารหัสด้วย TLS ขนาดก้อนข้อมูลเปลี่ยนได้ แต่ยังไม่มี header ของการขนส่งเพิ่มเข้ามา",
      parts: [{ k: "data", t: "Data (เข้ารหัสแล้ว)" }], fields: null
    },
    {
      device: "pcA", side: "A", layer: 5, act: "add", pdu: "Data",
      title: "Layer 5 — Session เปิดบทสนทนา",
      desc: "ตอนนี้ชั้น 5 กำลังเปิดเซสชันกับเครื่องปลายทางและทำเครื่องหมาย checkpoint ไว้ เผื่อสายหลุดจะได้ส่งต่อจากจุดเดิมได้ ข้อมูลยังคงเรียกว่า Data อยู่",
      parts: [pData], fields: null
    },
    {
      device: "pcA", side: "A", layer: 4, act: "add", pdu: l4Pdu,
      title: `Layer 4 — Transport ห่อเป็น ${l4Pdu}`,
      desc: l4Desc,
      parts: segment, fields: l4Fields
    },
    {
      device: "pcA", side: "A", layer: 3, act: "add", pdu: "Packet",
      title: "Layer 3 — Network ห่อเป็น Packet",
      desc: "ตอนนี้ชั้น 3 กำลังเติม IP Header ใส่ IP ต้นทางของเราและ IP ปลายทางที่ต้องการไป พร้อมตั้งค่า TTL ไว้ที่ 64 เพื่อกันไม่ให้ข้อมูลวนไม่รู้จบ",
      parts: packet,
      fields: {
        title: "IP Header",
        rows: [
          ["Version", "4"],
          ["Source IP", S.pcA.ip],
          ["Destination IP", S.pcB.ip],
          ["TTL", "64"],
          ["Protocol", isTcp ? "6 (TCP)" : "17 (UDP)"],
          ["Header Checksum", "0x7C4E"]
        ]
      }
    },
    {
      device: "pcA", side: "A", layer: 2, act: "add", pdu: "Frame",
      title: "Layer 2 — Data Link ห่อเป็น Frame",
      desc: "ตอนนี้ชั้น 2 กำลังเติม MAC Header ไว้ด้านหน้า และ FCS ไว้ด้านหลัง สังเกตว่า MAC ปลายทางไม่ใช่ของเครื่อง B แต่เป็นของ Router เพราะเครื่อง B อยู่คนละวง เราจึงส่งให้ประตูทางออกก่อน",
      parts: frameA,
      fields: {
        title: "Ethernet Header + Trailer",
        rows: [
          ["Destination MAC", `${S.gateway.mac}  ← ของ Router`],
          ["Source MAC", `${S.pcA.mac}  ← ของเครื่อง A`],
          ["EtherType", "0x0800 (IPv4)"],
          ["Trailer: FCS", "CRC-32 ไว้ตรวจว่าเฟรมเสียหายไหม"]
        ]
      }
    },
    {
      device: "pcA", side: "A", layer: 1, act: "add", pdu: "Bits",
      title: "Layer 1 — Physical แปลงเป็นบิต",
      desc: "ตอนนี้ชั้น 1 กำลังแปลงเฟรมทั้งก้อนให้เป็นสัญญาณไฟฟ้า 0 กับ 1 แล้วยิงออกไปตามสาย นี่คือจุดที่ข้อมูลออกจากเครื่องจริง ๆ",
      parts: [pBits], fields: null
    },

    /* ===== เดินทางถึง Switch ===== */
    {
      device: "sw", side: "wire", layer: 0, act: "pass", pdu: "Bits", wire: "link1",
      title: "บิตวิ่งไปตามสายเข้าสู่ Switch",
      desc: "ตอนนี้ข้อมูลเป็นสัญญาณวิ่งอยู่บนสาย ยังไม่มีใครแกะอะไรทั้งนั้น",
      parts: [pBits], fields: null
    },
    {
      device: "sw", side: "mid", layer: 2, act: "pass", pdu: "Frame",
      title: "Switch อ่านแค่ Layer 2 แล้วส่งต่อ",
      desc: "ตอนนี้ Switch ประกอบบิตกลับเป็นเฟรม แล้วอ่านเฉพาะ MAC ปลายทางเพื่อเปิดตาราง MAC ดูว่าต้องส่งออกพอร์ตไหน สังเกตว่า Switch ไม่แตะ IP Header เลย และไม่แก้ไขอะไรในเฟรม ส่งต่อไปเหมือนเดิมทุกอย่าง",
      parts: frameA,
      fields: {
        title: "สิ่งที่ Switch ทำ",
        rows: [
          ["อ่าน Destination MAC", S.gateway.mac],
          ["เปิด MAC Address Table", "MAC นี้อยู่ที่พอร์ต 3"],
          ["ส่งออก", "เฉพาะพอร์ต 3 พอร์ตเดียว"],
          ["แก้ไขเฟรมไหม", "ไม่แก้ — ส่งต่อทั้งก้อนเหมือนเดิม"]
        ]
      }
    },
    {
      device: "rt", side: "wire", layer: 0, act: "pass", pdu: "Bits", wire: "link2",
      title: "เฟรมวิ่งต่อจาก Switch ไป Router",
      desc: "ตอนนี้เฟรมเดิมกำลังวิ่งไปยัง Router ซึ่งเป็นประตูทางออกของวงแลนนี้",
      parts: [pBits], fields: null
    },

    /* ===== Router แกะถึง Layer 3 แล้วห่อ Layer 2 ใหม่ ===== */
    {
      device: "rt", side: "mid", layer: 2, act: "strip", pdu: "Packet",
      title: "Router แกะ Frame ทิ้ง (ถึงแค่ Layer 2)",
      desc: "ตอนนี้ Router ตรวจ FCS ว่าเฟรมไม่เสียหาย และเห็นว่า MAC ปลายทางคือของตัวเอง จึงแกะ MAC Header กับ Trailer ทิ้ง เหลือเป็น Packet ส่งขึ้นไปให้ชั้น 3 พิจารณาต่อ",
      parts: packet,
      fields: {
        title: "สิ่งที่ถูกแกะทิ้ง",
        rows: [
          ["MAC Header", "ถอดออก เพราะใช้แค่ระหว่าง hop นี้"],
          ["Trailer (FCS)", "ตรวจแล้วว่าเฟรมสมบูรณ์ จึงถอดทิ้ง"],
          ["เหลืออะไร", "Packet ที่ยังมี IP Header ครบ"]
        ]
      }
    },
    {
      device: "rt", side: "mid", layer: 3, act: "pass", pdu: "Packet",
      title: "Router อ่าน IP และลดค่า TTL",
      desc: "ตอนนี้ Router กำลังอ่าน IP ปลายทางแล้วเทียบกับ Routing Table เพื่อเลือกเส้นทาง จากนั้นลด TTL ลง 1 จาก 64 เหลือ 63 จุดสำคัญคือ IP ต้นทางและปลายทางไม่เปลี่ยนเลย",
      parts: packet,
      fields: {
        title: "IP Header หลังผ่าน Router",
        rows: [
          ["Source IP", `${S.pcA.ip}  (ไม่เปลี่ยน)`],
          ["Destination IP", `${S.pcB.ip}  (ไม่เปลี่ยน)`],
          ["TTL", "64 → 63  (ลดลง 1 ทุก hop)"],
          ["Routing Table", "ปลายทางนี้ออกทางอินเทอร์เฟซ WAN"]
        ]
      }
    },
    {
      device: "rt", side: "mid", layer: 2, act: "rebuild", pdu: "Frame",
      title: "Router ห่อ Frame ใหม่ ด้วย MAC คู่ใหม่",
      desc: "ตอนนี้ Router กำลังห่อ Layer 2 ขึ้นมาใหม่ทั้งหมด โดยใช้ MAC ของขา WAN ตัวเองเป็นต้นทาง และ MAC ของเครื่อง B เป็นปลายทาง นี่คือคำตอบว่าทำไม MAC เปลี่ยนทุก hop แต่ IP ไม่เปลี่ยน — เพราะ MAC ใช้แค่ช่วงต่อช่วง ส่วน IP ใช้ตลอดเส้นทาง",
      parts: frameA,
      fields: {
        title: "Ethernet Header ชุดใหม่",
        rows: [
          ["Destination MAC", `${S.pcB.mac}  ← เปลี่ยนเป็นของเครื่อง B`],
          ["Source MAC", `${S.routerWan.mac}  ← เปลี่ยนเป็นขา WAN ของ Router`],
          ["Source IP", `${S.pcA.ip}  ← ยังคงเดิม`],
          ["Destination IP", `${S.pcB.ip}  ← ยังคงเดิม`]
        ]
      }
    },
    {
      device: "pcB", side: "wire", layer: 0, act: "pass", pdu: "Bits", wire: "link3",
      title: "เฟรมชุดใหม่วิ่งไปหา Computer B",
      desc: "ตอนนี้ข้อมูลถูกแปลงเป็นบิตอีกครั้งแล้ววิ่งไปตามสายเข้าสู่เครื่องปลายทาง",
      parts: [pBits], fields: null
    },

    /* ===== ฝั่งรับ: Computer B แกะทีละชั้นจากล่างขึ้นบน ===== */
    {
      device: "pcB", side: "B", layer: 1, act: "strip", pdu: "Bits",
      title: "Layer 1 — Physical รับสัญญาณ",
      desc: "ตอนนี้เครื่อง B กำลังอ่านสัญญาณจากสายแล้วแปลงกลับมาเป็นบิต 0 กับ 1 ตามเดิม",
      parts: [pBits], fields: null
    },
    {
      device: "pcB", side: "B", layer: 2, act: "strip", pdu: "Packet",
      title: "Layer 2 — Data Link แกะ Frame ออก",
      desc: "ตอนนี้ชั้น 2 กำลังตรวจว่า MAC ปลายทางเป็นของเครื่องเราไหม แล้วคำนวณ FCS เทียบดูว่าเฟรมเสียหายระหว่างทางหรือเปล่า ถ้าผ่านก็ถอด MAC Header และ Trailer ทิ้ง กล่องข้อมูลเล็กลงหนึ่งชั้น",
      parts: packet,
      fields: {
        title: "ตรวจก่อนถอด",
        rows: [
          ["Destination MAC ตรงกับเราไหม", `${S.pcB.mac} → ตรง รับไว้`],
          ["FCS ผ่านไหม", "ผ่าน เฟรมไม่เสียหาย"],
          ["ถอดอะไรออก", "MAC Header + Trailer"]
        ]
      }
    },
    {
      device: "pcB", side: "B", layer: 3, act: "strip", pdu: l4Pdu,
      title: "Layer 3 — Network แกะ IP Header ออก",
      desc: `ตอนนี้ชั้น 3 กำลังตรวจว่า Destination IP คือ ${S.pcB.ip} ตรงกับเครื่องนี้จริง จึงถอด IP Header ทิ้งแล้วส่งต่อขึ้นไปให้ชั้น Transport กล่องข้อมูลเล็กลงอีกชั้น`,
      parts: segment,
      fields: {
        title: "ตรวจก่อนถอด",
        rows: [
          ["Destination IP", `${S.pcB.ip} → ตรงกับเครื่องนี้`],
          ["Protocol", isTcp ? "6 → ส่งต่อให้ TCP" : "17 → ส่งต่อให้ UDP"],
          ["ถอดอะไรออก", "IP Header ทั้งก้อน"]
        ]
      }
    },
    {
      device: "pcB", side: "B", layer: 4, act: "strip", pdu: "Data",
      title: `Layer 4 — Transport แกะ ${l4Name} ออก`,
      desc: isTcp
        ? "ตอนนี้ชั้น 4 กำลังเรียง Segment ตาม Sequence Number ให้ถูกลำดับ ส่ง ACK กลับไปบอกผู้ส่งว่าได้รับแล้ว ถ้าชิ้นไหนหายก็ขอส่งซ้ำ จากนั้นดู Port ปลายทาง 443 เพื่อรู้ว่าต้องส่งข้อมูลให้โปรแกรมไหน"
        : "ตอนนี้ชั้น 4 กำลังดู Port ปลายทาง 53 เพื่อส่งข้อมูลให้บริการ DNS สังเกตว่า UDP ไม่ต้องเรียงลำดับ ไม่ต้องส่ง ACK และไม่ขอส่งซ้ำ ถ้าข้อมูลหายระหว่างทางก็หายไปเลย",
      parts: [pData],
      fields: {
        title: `สิ่งที่ ${isTcp ? "TCP" : "UDP"} ทำที่ปลายทาง`,
        rows: isTcp
          ? [["Destination Port", l4Port], ["เรียงลำดับ", "ใช้ Sequence Number เรียงให้ถูก"], ["ตอบกลับ", "ส่ง ACK ยืนยันการรับ"], ["ข้อมูลหาย", "ขอให้ส่งซ้ำ"]]
          : [["Destination Port", l4Port], ["เรียงลำดับ", "ไม่ทำ"], ["ตอบกลับ", "ไม่มี ACK"], ["ข้อมูลหาย", "ไม่ขอส่งซ้ำ ปล่อยหายไป"]]
      }
    },
    {
      device: "pcB", side: "B", layer: 5, act: "strip", pdu: "Data",
      title: "Layer 5 — Session จับคู่บทสนทนา",
      desc: "ตอนนี้ชั้น 5 กำลังจับคู่ข้อมูลที่เข้ามาเข้ากับเซสชันที่เปิดค้างไว้ ให้ตรงกับบทสนทนาที่ถูกต้อง",
      parts: [pData], fields: null
    },
    {
      device: "pcB", side: "B", layer: 6, act: "strip", pdu: "Data",
      title: "Layer 6 — Presentation ถอดรหัสกลับ",
      desc: "ตอนนี้ชั้น 6 กำลังถอดรหัส TLS คลายการบีบอัด และแปลงรูปแบบข้อมูลกลับให้อยู่ในรูปที่โปรแกรมอ่านได้",
      parts: [{ k: "data", t: "Data (ถอดรหัสแล้ว)" }], fields: null
    },
    {
      device: "pcB", side: "B", layer: 7, act: "strip", pdu: "Data",
      title: "Layer 7 — Application ได้ข้อมูลครบถ้วน",
      desc: "เสร็จแล้ว โปรแกรมบนเครื่อง B ได้รับข้อมูลเดิมเหมือนตอนที่เครื่อง A ส่งออกมาทุกประการ header ทุกชั้นถูกแกะออกหมดแล้ว เหลือแค่ Data ก้อนเดียวเท่าเดิม",
      parts: [pData], fields: null
    }
  ];
}
