/* =========================================================================
   quiz.js — คลังข้อสอบแบบปรนัย (แยกจาก logic ของระบบ quiz ใน script.js)
   โครงสร้างแต่ละข้อ:
     q       : โจทย์
     choices : ตัวเลือก (array)
     answer  : index ของคำตอบที่ถูก (เริ่มนับจาก 0)
     why     : คำอธิบายที่จะโชว์หลังตอบ
     cat     : หมวดหมู่ ใช้แสดงเป็นป้ายกำกับ
   เพิ่มข้อสอบใหม่ได้เลยโดยต่อ object ท้าย array นี้
   ========================================================================= */

const QUIZ = [
  {
    cat: "Layer & หน้าที่",
    q: "OSI Model ชั้นใดทำหน้าที่หาเส้นทาง (Routing) ให้ข้อมูลเดินทางข้ามเครือข่าย?",
    choices: ["Layer 2 — Data Link", "Layer 3 — Network", "Layer 4 — Transport", "Layer 5 — Session"],
    answer: 1,
    why: "Layer 3 (Network) ใช้ IP Address เป็น logical address เพื่อตัดสินใจเส้นทาง ส่วน Layer 2 ส่งได้แค่ภายในวงเดียวกันด้วย MAC Address"
  },
  {
    cat: "Layer & หน้าที่",
    q: "การเข้ารหัส (Encryption) และการบีบอัดข้อมูล (Compression) เป็นหน้าที่ของชั้นใด?",
    choices: ["Application", "Presentation", "Session", "Transport"],
    answer: 1,
    why: "Layer 6 (Presentation) ทำ 3 งานหลักคือ แปลงรูปแบบข้อมูล เข้ารหัส/ถอดรหัส และบีบอัด"
  },
  {
    cat: "Layer & หน้าที่",
    q: "ชั้นใดรับผิดชอบการเปิด ดูแล และปิดบทสนทนาระหว่างสองเครื่อง รวมถึงการทำ Checkpoint?",
    choices: ["Layer 4 — Transport", "Layer 5 — Session", "Layer 6 — Presentation", "Layer 7 — Application"],
    answer: 1,
    why: "Layer 5 (Session) จัดการ establish / maintain / terminate เซสชัน และวาง checkpoint เพื่อกู้การส่งต่อเมื่อสายหลุด"
  },
  {
    cat: "Layer & หน้าที่",
    q: "Flow Control, Error Recovery และ Segmentation เป็นหน้าที่ของชั้นใด?",
    choices: ["Network", "Transport", "Data Link", "Physical"],
    answer: 1,
    why: "Layer 4 (Transport) ซอยข้อมูลเป็น segment คุมความเร็วด้วย flow control และส่งซ้ำเมื่อข้อมูลหาย (กรณี TCP)"
  },
  {
    cat: "Layer & หน้าที่",
    q: "ชั้นใดของ OSI อยู่ใกล้ผู้ใช้มากที่สุด?",
    choices: ["Layer 1 — Physical", "Layer 4 — Transport", "Layer 7 — Application", "Layer 6 — Presentation"],
    answer: 2,
    why: "Layer 7 (Application) เป็นชั้นบนสุด เป็นจุดที่โปรแกรมของผู้ใช้เรียกใช้บริการเครือข่าย"
  },
  {
    cat: "PDU",
    q: "PDU ของ Layer 2 (Data Link) เรียกว่าอะไร?",
    choices: ["Bit", "Frame", "Packet", "Segment"],
    answer: 1,
    why: "ท่องจากล่างขึ้นบน: Bit (L1) → Frame (L2) → Packet (L3) → Segment (L4) → Data (L5–L7)"
  },
  {
    cat: "PDU",
    q: "ข้อมูลที่มี IP Header ห่อหุ้มอยู่ เรียกว่า PDU ชนิดใด?",
    choices: ["Frame", "Packet", "Segment", "Datagram แบบ UDP"],
    answer: 1,
    why: "IP Header ถูกเติมที่ Layer 3 ทำให้ PDU กลายเป็น Packet"
  },
  {
    cat: "PDU",
    q: "PDU ของ UDP ที่ Layer 4 เรียกว่าอะไร?",
    choices: ["Segment", "Datagram", "Frame", "Packet"],
    answer: 1,
    why: "TCP เรียก PDU ของตัวเองว่า Segment ส่วน UDP เรียกว่า Datagram แม้จะอยู่ชั้นเดียวกัน"
  },
  {
    cat: "PDU",
    q: "Layer 5, 6 และ 7 มี PDU เป็นอะไร?",
    choices: ["Data ทั้งสามชั้น", "Segment ทั้งสามชั้น", "แต่ละชั้นมี PDU ต่างกัน", "ไม่มี PDU"],
    answer: 0,
    why: "สามชั้นบนของ OSI ใช้ PDU ร่วมกันคือ Data เพราะยังไม่มีการเติม header ของการขนส่ง"
  },
  {
    cat: "Protocol",
    q: "โปรโตคอล TCP และ UDP ทำงานอยู่ที่ชั้นใดของ OSI?",
    choices: ["Layer 3", "Layer 4", "Layer 5", "Layer 7"],
    answer: 1,
    why: "TCP และ UDP เป็นโปรโตคอลของ Transport Layer (Layer 4) ทั้งคู่ใช้หมายเลข Port ระบุปลายทาง"
  },
  {
    cat: "Protocol",
    q: "โปรโตคอล ICMP ที่คำสั่ง ping ใช้งาน อยู่ในชั้นใด?",
    choices: ["Layer 2 — Data Link", "Layer 3 — Network", "Layer 4 — Transport", "Layer 7 — Application"],
    answer: 1,
    why: "ICMP เป็นโปรโตคอลของ Layer 3 ใช้ส่งข้อความควบคุมและรายงานข้อผิดพลาด เช่น ping และ traceroute"
  },
  {
    cat: "Protocol",
    q: "Ethernet (IEEE 802.3) จัดอยู่ในชั้นใดเป็นหลัก?",
    choices: ["Layer 1 เท่านั้น", "Layer 2 (และมีข้อกำหนดส่วนหนึ่งที่ Layer 1)", "Layer 3", "Layer 4"],
    answer: 1,
    why: "Ethernet กำหนดรูปแบบเฟรมและ MAC Address ซึ่งเป็นงานของ Layer 2 ส่วนข้อกำหนดเรื่องสายและสัญญาณเป็นของ Layer 1"
  },
  {
    cat: "Protocol",
    q: "HTTPS ใช้พอร์ตหมายเลขใด?",
    choices: ["80", "443", "8080", "22"],
    answer: 1,
    why: "HTTPS ใช้ TCP พอร์ต 443 ส่วน HTTP ธรรมดาใช้พอร์ต 80"
  },
  {
    cat: "Protocol",
    q: "DNS ตามปกติใช้พอร์ตและโปรโตคอลขนส่งใด?",
    choices: ["TCP 53 เท่านั้น", "UDP 53 เป็นหลัก และใช้ TCP 53 เมื่อข้อมูลใหญ่", "UDP 67", "TCP 25"],
    answer: 1,
    why: "DNS query ปกติใช้ UDP 53 เพราะเบาและเร็ว แต่จะสลับไปใช้ TCP 53 เมื่อคำตอบยาวเกินหรือทำ zone transfer"
  },
  {
    cat: "Protocol",
    q: "DHCP ใช้พอร์ตคู่ใดในการแจก IP อัตโนมัติ?",
    choices: ["UDP 67 และ 68", "TCP 20 และ 21", "UDP 53 และ 54", "TCP 110 และ 143"],
    answer: 0,
    why: "DHCP ใช้ UDP พอร์ต 67 ที่ฝั่งเซิร์ฟเวอร์ และพอร์ต 68 ที่ฝั่งไคลเอนต์"
  },
  {
    cat: "Protocol",
    q: "FTP ใช้พอร์ต 21 สำหรับอะไร?",
    choices: ["ส่งข้อมูลไฟล์", "ส่งคำสั่งควบคุม (control connection)", "เข้ารหัสข้อมูล", "ตรวจสอบสิทธิ์เท่านั้น"],
    answer: 1,
    why: "FTP ใช้พอร์ต 21 เป็นช่องคำสั่ง (control) และพอร์ต 20 เป็นช่องส่งข้อมูล (data)"
  },
  {
    cat: "Protocol",
    q: "โปรโตคอลใดใช้สำหรับส่งอีเมลออก (outgoing mail)?",
    choices: ["POP3", "IMAP", "SMTP", "SNMP"],
    answer: 2,
    why: "SMTP (พอร์ต 25 หรือ 587) ใช้ส่งอีเมลออก ส่วน POP3 (110) และ IMAP (143) ใช้ดึงอีเมลเข้ามาอ่าน"
  },
  {
    cat: "Device",
    q: "Router ทำงานที่ชั้นใดของ OSI Model?",
    choices: ["Layer 1", "Layer 2", "Layer 3", "Layer 4"],
    answer: 2,
    why: "Router อ่าน IP Address เพื่อเลือกเส้นทางส่งต่อ จึงเป็นอุปกรณ์ Layer 3"
  },
  {
    cat: "Device",
    q: "Switch แบบทั่วไป (unmanaged / L2 switch) ทำงานที่ชั้นใด?",
    choices: ["Layer 1", "Layer 2", "Layer 3", "Layer 7"],
    answer: 1,
    why: "Switch ตัดสินใจส่งต่อเฟรมโดยดูตาราง MAC Address จึงเป็นอุปกรณ์ Layer 2 (ถ้าเป็น L3 Switch จะ route ด้วย IP ได้เพิ่ม)"
  },
  {
    cat: "Device",
    q: "Hub และ Repeater ทำงานที่ชั้นใด?",
    choices: ["Layer 1 — Physical", "Layer 2 — Data Link", "Layer 3 — Network", "Layer 4 — Transport"],
    answer: 0,
    why: "Hub และ Repeater แค่ทวนและกระจายสัญญาณออกทุกพอร์ต ไม่อ่าน address ใด ๆ จึงอยู่ที่ Layer 1"
  },
  {
    cat: "Device",
    q: "อุปกรณ์ใดที่ตัดสินใจส่งต่อข้อมูลโดยอ้างอิง MAC Address?",
    choices: ["Router", "Switch", "Hub", "Modem"],
    answer: 1,
    why: "Switch เรียนรู้และจดจำ MAC Address ของแต่ละพอร์ตไว้ในตาราง MAC เพื่อส่งเฟรมไปเฉพาะพอร์ตที่ถูกต้อง"
  },
  {
    cat: "TCP vs UDP",
    q: "ข้อใดคือคุณสมบัติของ UDP?",
    choices: [
      "Connection-oriented และรับประกันว่าข้อมูลถึงแน่นอน",
      "Connectionless เร็ว โอเวอร์เฮดต่ำ แต่ไม่รับประกันว่าข้อมูลจะถึง",
      "มี 3-way handshake ก่อนส่งเสมอ",
      "มี Header ขนาด 20–60 ไบต์"
    ],
    answer: 1,
    why: "UDP เป็น connectionless ไม่มี handshake ไม่มี ACK Header เล็กแค่ 8 ไบต์ จึงเร็วแต่ไม่การันตีการส่งถึง"
  },
  {
    cat: "TCP vs UDP",
    q: "กระบวนการ 3-Way Handshake ของ TCP มีลำดับอย่างไร?",
    choices: ["ACK → SYN → SYN-ACK", "SYN → SYN-ACK → ACK", "SYN → ACK → FIN", "SYN-ACK → SYN → ACK"],
    answer: 1,
    why: "ฝั่งเริ่มส่ง SYN → ฝั่งรับตอบ SYN-ACK → ฝั่งเริ่มยืนยันด้วย ACK แล้วจึงเริ่มส่งข้อมูลจริง"
  },
  {
    cat: "TCP vs UDP",
    q: "งานประเภทใดเหมาะกับ UDP มากที่สุด?",
    choices: ["โอนไฟล์ขนาดใหญ่ที่ห้ามผิดเพี้ยน", "วิดีโอสตรีมมิ่งและ VoIP ที่ต้องการดีเลย์ต่ำ", "การทำธุรกรรมธนาคาร", "การส่งอีเมล"],
    answer: 1,
    why: "งานเรียลไทม์ยอมให้ข้อมูลหายได้บ้างเพื่อแลกกับความหน่วงต่ำ จึงเหมาะกับ UDP ส่วนงานที่ห้ามข้อมูลผิดพลาดต้องใช้ TCP"
  },
  {
    cat: "TCP vs UDP",
    q: "TCP Header มีขนาดเท่าใด เมื่อเทียบกับ UDP Header?",
    choices: ["TCP 8 ไบต์ / UDP 20 ไบต์", "TCP 20–60 ไบต์ / UDP 8 ไบต์", "เท่ากันคือ 20 ไบต์", "TCP 4 ไบต์ / UDP 4 ไบต์"],
    answer: 1,
    why: "TCP Header ใหญ่กว่า (20 ไบต์เป็นอย่างน้อย ขยายได้ถึง 60) เพราะต้องเก็บ Sequence, ACK, Flags และ Window ส่วน UDP มีแค่ 8 ไบต์"
  },
  {
    cat: "Encapsulation",
    q: "ระหว่างการ Encapsulation ที่ฝั่งส่ง ข้อมูลไหลไปในทิศทางใด?",
    choices: ["จาก Layer 1 ขึ้นไป Layer 7", "จาก Layer 7 ลงมา Layer 1", "จาก Layer 4 ออกทั้งสองทาง", "ไม่มีทิศทางแน่นอน"],
    answer: 1,
    why: "ฝั่งส่งทำ Encapsulation จากบนลงล่าง (7→1) โดยเติม header เพิ่มทีละชั้น ส่วนฝั่งรับทำ Decapsulation จากล่างขึ้นบน (1→7)"
  },
  {
    cat: "Encapsulation",
    q: "ชั้นใดเป็นชั้นเดียวที่เพิ่มทั้ง Header ด้านหน้าและ Trailer ด้านหลัง?",
    choices: ["Layer 4 — Transport", "Layer 3 — Network", "Layer 2 — Data Link", "Layer 1 — Physical"],
    answer: 2,
    why: "Layer 2 เติม Frame Header ด้านหน้าและ Trailer ที่มี FCS/CRC ด้านหลัง เพื่อให้ปลายทางตรวจสอบความถูกต้องของเฟรมได้"
  },
  {
    cat: "Address",
    q: "หมายเลข Port ถูกใช้ในชั้นใดของ OSI?",
    choices: ["Layer 2", "Layer 3", "Layer 4", "Layer 7"],
    answer: 2,
    why: "Port Number (0–65535) อยู่ใน TCP/UDP Header ที่ Layer 4 ใช้ระบุว่าข้อมูลเป็นของแอปพลิเคชันใด"
  },
  {
    cat: "Address",
    q: "MAC Address มีความยาวกี่บิต?",
    choices: ["32 บิต", "48 บิต", "64 บิต", "128 บิต"],
    answer: 1,
    why: "MAC Address ยาว 48 บิต (6 ไบต์) เขียนเป็นเลขฐานสิบหก เช่น 00:1A:2B:3C:4D:5E ส่วน IPv4 ยาว 32 บิต และ IPv6 ยาว 128 บิต"
  },
  {
    cat: "TCP/IP Model",
    q: "TCP/IP Model แบบ 4 ชั้น ชั้น Application ครอบคลุมชั้นใดของ OSI บ้าง?",
    choices: ["Layer 7 เท่านั้น", "Layer 6 และ 7", "Layer 5, 6 และ 7", "Layer 4, 5, 6 และ 7"],
    answer: 2,
    why: "TCP/IP ยุบ Session, Presentation และ Application ของ OSI รวมเป็นชั้น Application ชั้นเดียว"
  },
  {
    cat: "TCP/IP Model",
    q: "ชั้น Network Access ของ TCP/IP ตรงกับชั้นใดของ OSI?",
    choices: ["Layer 3 เท่านั้น", "Layer 1 และ Layer 2", "Layer 2 และ Layer 3", "Layer 1 เท่านั้น"],
    answer: 1,
    why: "Network Access (บางตำราเรียก Link Layer) รวม Data Link (L2) กับ Physical (L1) ของ OSI เข้าด้วยกัน"
  },
  {
    cat: "Mnemonic",
    q: "ประโยคช่วยจำ \"All People Seem To Need Data Processing\" ใช้ท่องชั้น OSI ในทิศทางใด?",
    choices: ["Layer 1 ขึ้นไป Layer 7", "Layer 7 ลงมา Layer 1", "เฉพาะ 4 ชั้นบน", "เฉพาะ 3 ชั้นล่าง"],
    answer: 1,
    why: "A-P-S-T-N-D-P ตรงกับ Application, Presentation, Session, Transport, Network, Data Link, Physical คือไล่จาก Layer 7 ลงมา Layer 1"
  },

  /* ===================== ข้อสอบของบทใหม่ ===================== */

  {
    cat: "Device",
    q: "อุปกรณ์ใดต่อไปนี้แยก Broadcast Domain ออกจากกันได้?",
    choices: ["Hub", "Switch ธรรมดา", "Router", "Repeater"],
    answer: 2,
    why: "Router (และ Layer 3 Switch) เท่านั้นที่หยุดการกระจาย broadcast ได้ ส่วน Switch ธรรมดาแยกได้แค่ collision domain แต่ broadcast ยังทะลุไปทุกพอร์ต"
  },
  {
    cat: "Device",
    q: "Switch 24 พอร์ตที่ยังไม่ได้แบ่ง VLAN มีกี่ collision domain และกี่ broadcast domain?",
    choices: ["24 collision domain และ 1 broadcast domain", "1 collision domain และ 24 broadcast domain", "24 อย่างละเท่ากัน", "1 อย่างละเท่ากัน"],
    answer: 0,
    why: "Switch แยก collision domain ให้ทุกพอร์ต จึงได้ 24 โดเมน แต่ broadcast ยังกระจายทั่วทั้งตัว จึงมี broadcast domain เดียว (จะแยกได้ต่อเมื่อแบ่ง VLAN)"
  },
  {
    cat: "Device",
    q: "Access Point ทำงานอยู่ที่ชั้นใดเป็นหลัก?",
    choices: ["Layer 1 เพราะเป็นเรื่องคลื่นวิทยุ", "Layer 2 เพราะส่งต่อเฟรมด้วย MAC Address", "Layer 3 เพราะแจก IP", "Layer 7"],
    answer: 1,
    why: "Access Point แปลงเฟรมระหว่างมาตรฐาน 802.11 กับ 802.3 และตัดสินใจด้วย MAC Address จึงอยู่ Layer 2 ส่วนการแจก IP เป็นหน้าที่ของ DHCP บนเราเตอร์ ไม่ใช่ของ AP"
  },
  {
    cat: "Device",
    q: "ข้อใดอธิบายการทำงานของ Hub ได้ถูกต้อง?",
    choices: [
      "อ่าน MAC แล้วส่งเฉพาะพอร์ตปลายทาง",
      "ทวนสัญญาณแล้วส่งออกทุกพอร์ตโดยไม่อ่าน address ใด ๆ",
      "อ่าน IP เพื่อเลือกเส้นทาง",
      "กรองทราฟฟิกตามกฎที่ตั้งไว้"
    ],
    answer: 1,
    why: "Hub อยู่ Layer 1 มันเห็นข้อมูลเป็นแค่สัญญาณไฟฟ้า จึงทำได้แค่ขยายแล้วกระจายออกทุกพอร์ต ทำให้ทุกเครื่องอยู่ collision domain เดียวกัน"
  },
  {
    cat: "Device",
    q: "อุปกรณ์ใดถือว่าทำงานได้ครบถึง Layer 7?",
    choices: ["Bridge", "Layer 3 Switch", "Gateway", "Repeater"],
    answer: 2,
    why: "Gateway เชื่อมสองระบบที่ใช้โปรโตคอลต่างกันจึงต้องแปลงข้อมูลได้ถึงระดับแอปพลิเคชัน ส่วน Bridge อยู่ L2, Layer 3 Switch อยู่ L3 และ Repeater อยู่ L1"
  },
  {
    cat: "IP Address",
    q: "IP ใดต่อไปนี้เป็น Private IP?",
    choices: ["172.32.5.10", "192.169.1.1", "10.55.3.7", "11.0.0.1"],
    answer: 2,
    why: "ช่วง Private มีสามช่วงคือ 10.0.0.0/8, 172.16–172.31 และ 192.168.x.x ดังนั้น 10.55.3.7 เป็น Private ส่วน 172.32 กับ 192.169 อยู่นอกช่วงจึงเป็น Public"
  },
  {
    cat: "IP Address",
    q: "Subnet mask 255.255.255.0 เขียนเป็น CIDR ได้อย่างไร และมี host ใช้ได้กี่ตัว?",
    choices: ["/24 และใช้ได้ 254 host", "/24 และใช้ได้ 256 host", "/16 และใช้ได้ 254 host", "/25 และใช้ได้ 126 host"],
    answer: 0,
    why: "255.255.255.0 มีบิต 1 อยู่ 24 ตัว จึงเป็น /24 เหลือบิต host 8 ตัว ได้ 256 ที่อยู่ หัก network กับ broadcast ออก 2 เหลือใช้จริง 254"
  },
  {
    cat: "IP Address",
    q: "ข้อใดกล่าวถูกต้องเกี่ยวกับ IPv6?",
    choices: [
      "ยาว 64 บิต เขียนเป็นเลขฐานสิบ",
      "ยาว 128 บิต เขียนเป็นเลขฐานสิบหก และไม่มี broadcast",
      "ยาว 128 บิต แต่ยังมี broadcast เหมือน IPv4",
      "ยาว 32 บิตเท่า IPv4 แต่เขียนต่างกัน"
    ],
    answer: 1,
    why: "IPv6 ยาว 128 บิต เขียนเป็นฐานสิบหก 8 กลุ่ม และยกเลิก broadcast ไปเลย โดยใช้ multicast ทำงานแทน"
  },
  {
    cat: "MAC Address",
    q: "24 บิตแรกของ MAC Address เรียกว่าอะไร?",
    choices: ["NIC Specific", "OUI (Organizationally Unique Identifier)", "Host ID", "Network ID"],
    answer: 1,
    why: "24 บิตแรกคือ OUI ซึ่งองค์กร IEEE ออกให้ผู้ผลิตแต่ละราย ส่วน 24 บิตหลังคือ NIC Specific ที่ผู้ผลิตกำหนดเองให้ไม่ซ้ำกัน"
  },
  {
    cat: "MAC Address",
    q: "ข้อใดคือความต่างที่ถูกต้องระหว่าง MAC Address กับ IP Address?",
    choices: [
      "MAC อยู่ Layer 3 เปลี่ยนได้ ส่วน IP อยู่ Layer 2 เปลี่ยนไม่ได้",
      "MAC อยู่ Layer 2 ติดมากับฮาร์ดแวร์ ส่วน IP อยู่ Layer 3 เปลี่ยนตามเครือข่ายที่ไปต่อ",
      "ทั้งคู่อยู่ Layer 2 เหมือนกัน",
      "MAC ยาว 32 บิต ส่วน IP ยาว 48 บิต"
    ],
    answer: 1,
    why: "MAC เป็น physical address 48 บิตที่ Layer 2 ฝังมาจากโรงงาน ส่วน IP เป็น logical address ที่ Layer 3 ซึ่งเปลี่ยนได้ตามวงเครือข่ายที่เครื่องไปเชื่อมต่อ"
  },
  {
    cat: "Encapsulation",
    q: "เมื่อ Packet เดินทางผ่าน Router สิ่งใดเกิดขึ้น?",
    choices: [
      "Router แกะถึง Layer 2 แล้วส่งต่อโดยไม่แก้อะไร",
      "Router แกะถึง Layer 3 อ่าน IP ลด TTL แล้วห่อ Frame ใหม่ด้วย MAC คู่ใหม่",
      "Router เปลี่ยนทั้ง IP และ MAC ปลายทาง",
      "Router แกะถึง Layer 7 เพื่ออ่านเนื้อหา"
    ],
    answer: 1,
    why: "Router แกะเฟรมทิ้งเพื่ออ่าน IP Header ลด TTL ลง 1 แล้วห่อ Layer 2 ขึ้นมาใหม่ด้วย MAC ของ hop ถัดไป ส่วน IP ต้นทาง–ปลายทางยังคงเดิม"
  },
  {
    cat: "Encapsulation",
    q: "Switch ทำอะไรกับเฟรมที่วิ่งผ่านมันบ้าง?",
    choices: [
      "อ่าน MAC ปลายทางแล้วส่งออกเฉพาะพอร์ตที่ถูกต้อง โดยไม่แก้ไขเฟรม",
      "แกะ IP Header ออกแล้วห่อใหม่",
      "ลดค่า TTL ลง 1",
      "เปลี่ยน MAC ต้นทางเป็นของตัวเอง"
    ],
    answer: 0,
    why: "Switch ทำงานแค่ Layer 2 คืออ่าน MAC ปลายทางเทียบกับตาราง MAC แล้วส่งต่อออกพอร์ตที่ถูกต้อง ไม่แตะ IP Header และไม่แก้ไขอะไรในเฟรม ส่วนการลด TTL เป็นงานของ Router"
  },
  {
    cat: "Encapsulation",
    q: "ข้อใดถูกต้องเกี่ยวกับ MAC และ IP ระหว่างการเดินทางข้ามหลาย Router?",
    choices: [
      "MAC คงเดิม แต่ IP เปลี่ยนทุก hop",
      "MAC เปลี่ยนทุก hop แต่ IP คงเดิม",
      "เปลี่ยนทั้งคู่ทุก hop",
      "คงเดิมทั้งคู่"
    ],
    answer: 1,
    why: "MAC ใช้ส่งกันแค่ระหว่าง hop ต่อ hop จึงถูกเขียนใหม่ทุกครั้งที่ผ่าน Router ส่วน IP เป็นที่อยู่ของปลายทางจริงจึงคงเดิมตลอดเส้นทาง"
  },
  {
    cat: "Encapsulation",
    q: "ชั้นใดที่ทำให้ PDU เปลี่ยนชื่อจาก Segment ไปเป็น Packet?",
    choices: ["Layer 2 ตอนเติม MAC Header", "Layer 3 ตอนเติม IP Header", "Layer 4 ตอนเติม TCP Header", "Layer 1 ตอนแปลงเป็นบิต"],
    answer: 1,
    why: "เมื่อ Layer 3 เติม IP Header ทับ Segment เข้าไป PDU จะถูกเรียกว่า Packet และเมื่อ Layer 2 เติม MAC Header กับ Trailer อีกชั้นจึงกลายเป็น Frame"
  },
  {
    cat: "Network Type",
    q: "เครือข่ายที่เชื่อมวิทยาเขตหลายแห่งภายในเมืองเดียวกัน จัดเป็นเครือข่ายประเภทใด?",
    choices: ["PAN", "LAN", "MAN", "WAN"],
    answer: 2,
    why: "MAN (Metropolitan Area Network) ครอบคลุมระดับเมือง ราว 5–50 กิโลเมตร ใหญ่กว่า LAN ที่อยู่ในอาคารเดียว แต่ยังไม่ข้ามจังหวัดหรือประเทศแบบ WAN"
  },
  {
    cat: "Network Type",
    q: "การเชื่อมหูฟังบลูทูธเข้ากับโทรศัพท์ จัดเป็นเครือข่ายประเภทใด?",
    choices: ["PAN", "LAN", "MAN", "WAN"],
    answer: 0,
    why: "PAN (Personal Area Network) คือเครือข่ายรอบตัวคนหนึ่งคน ระยะราว 1–10 เมตร ใช้เทคโนโลยีอย่าง Bluetooth, NFC หรือ Zigbee"
  },
  {
    cat: "Topology",
    q: "Topology ใดที่สายแกนกลางขาดเพียงจุดเดียวแล้วเครือข่ายล่มทั้งระบบ?",
    choices: ["Star", "Bus", "Full Mesh", "Tree"],
    answer: 1,
    why: "Bus ใช้สายแกนกลางเส้นเดียวให้ทุกเครื่องเกาะ ถ้าสายเส้นนี้ขาดจะล่มทั้งระบบ และยังหาจุดเสียได้ยากมากเพราะต้องไล่ตรวจทั้งเส้น"
  },
  {
    cat: "Topology",
    q: "Full Mesh Topology ที่มี 6 node ต้องใช้สายเชื่อมกี่เส้น?",
    choices: ["6 เส้น", "12 เส้น", "15 เส้น", "30 เส้น"],
    answer: 2,
    why: "ใช้สูตร n(n−1)/2 แทนค่า 6 จะได้ 6 คูณ 5 หารด้วย 2 เท่ากับ 15 เส้น นี่คือเหตุผลที่ Full Mesh แพงมากเมื่อ node เพิ่มขึ้น"
  },
  {
    cat: "Topology",
    q: "Topology แบบใดที่นิยมใช้มากที่สุดในเครือข่ายปัจจุบัน และเพราะอะไร?",
    choices: [
      "Bus เพราะใช้สายน้อยที่สุด",
      "Ring เพราะไม่มีการชนกันของข้อมูล",
      "Star เพราะสายเส้นหนึ่งขาดกระทบแค่เครื่องเดียว และหาจุดเสียง่าย",
      "Full Mesh เพราะทนทานที่สุด"
    ],
    answer: 2,
    why: "Star เป็นแบบที่ใช้จริงมากที่สุด เพราะแต่ละเครื่องมีสายของตัวเองเข้าสวิตช์ สายขาดเส้นเดียวกระทบแค่เครื่องนั้น เพิ่มถอดเครื่องง่าย และดูจุดเสียได้จากพอร์ตบนสวิตช์เลย"
  }
];
