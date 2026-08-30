/* =========================================================================
   data.js — คลังข้อมูลเนื้อหาทั้งหมด (แยกออกจาก logic แสดงผลใน script.js)
   แก้ไข/เพิ่มเนื้อหาได้ที่ไฟล์นี้ไฟล์เดียว โดยไม่ต้องแตะโค้ดแสดงผล
   ========================================================================= */

/* -------------------------------------------------------------------------
   1) ข้อมูล OSI 7 Layers
   เรียงจาก Layer 7 (บนสุด / ใกล้ผู้ใช้) ลงไป Layer 1 (ล่างสุด / ใกล้สายสัญญาณ)
   - color : สีประจำชั้น เพื่อช่วยจำ (ส่งเข้า CSS custom property)
   - pdu   : หน่วยข้อมูลของชั้นนั้น (Protocol Data Unit)
   ------------------------------------------------------------------------- */
const OSI_LAYERS = [
  {
    num: 7,
    name: "Application",
    thai: "ชั้นแอปพลิเคชัน",
    color: "#ef4444",
    pdu: "Data",
    short: "ประตูที่โปรแกรมใช้คุยกับเครือข่าย",
    func: "เป็นชั้นที่ใกล้ผู้ใช้มากที่สุด ทำหน้าที่เป็นหน้าร้านให้โปรแกรม (เบราว์เซอร์ อีเมล แอปแชท) เรียกใช้บริการเครือข่ายได้ ชั้นนี้ไม่ใช่ตัวแอปเอง แต่เป็นชุดโปรโตคอลที่แอปเรียกใช้ เช่น เวลาเรากดเปิดเว็บ เบราว์เซอร์จะสร้างคำสั่ง HTTP GET ขึ้นมาที่ชั้นนี้",
    protocols: ["HTTP", "HTTPS", "FTP", "SMTP", "POP3", "IMAP", "DNS", "DHCP", "SNMP", "Telnet", "SSH"],
    devices: ["Firewall แบบ Layer 7 (NGFW)", "Web Proxy / API Gateway", "Load Balancer ระดับ Application"],
    remember: "เห็นชื่อบริการที่ผู้ใช้สัมผัสได้โดยตรง → Layer 7"
  },
  {
    num: 6,
    name: "Presentation",
    thai: "ชั้นนำเสนอข้อมูล",
    color: "#f97316",
    pdu: "Data",
    short: "นักแปลภาษา + คนบีบอัด + คนเข้ารหัส",
    func: "แปลงรูปแบบข้อมูลให้ทั้งสองฝั่งเข้าใจตรงกัน ทำ 3 งานหลักคือ (1) Translation แปลงรหัสอักขระหรือรูปแบบไฟล์ เช่น ASCII, UTF-8, JPEG, MP4 (2) Encryption / Decryption เข้ารหัสและถอดรหัส เช่น SSL/TLS (3) Compression บีบอัดข้อมูลให้เล็กลงก่อนส่ง",
    protocols: ["SSL / TLS", "JPEG, PNG, GIF", "MPEG, MP3", "ASCII, Unicode (UTF-8)", "XDR"],
    devices: ["Gateway ที่ทำการแปลงรูปแบบข้อมูล", "SSL Offloader / SSL Accelerator"],
    remember: "อะไรที่เกี่ยวกับรูปแบบไฟล์ / เข้ารหัส / บีบอัด → Layer 6"
  },
  {
    num: 5,
    name: "Session",
    thai: "ชั้นจัดการเซสชัน",
    color: "#eab308",
    pdu: "Data",
    short: "ผู้จัดการบทสนทนา เปิด–คุม–ปิด",
    func: "ควบคุมบทสนทนาระหว่างสองเครื่อง คือเปิดเซสชัน (establish) ดูแลระหว่างคุย (maintain) และปิดเมื่อจบ (terminate) รวมถึงกำหนดว่าใครพูดได้ตอนไหน (half duplex / full duplex) และทำ Checkpoint เพื่อให้ส่งไฟล์ใหญ่ต่อจากจุดเดิมได้เมื่อสายหลุด",
    protocols: ["NetBIOS", "RPC", "PPTP", "SMB (บางส่วน)", "SOCKS", "NFS"],
    devices: ["Gateway", "Load Balancer ที่ทำ sticky session"],
    remember: "เปิด / ปิด / กู้คืนการสนทนา และ Checkpoint → Layer 5"
  },
  {
    num: 4,
    name: "Transport",
    thai: "ชั้นขนส่งข้อมูล",
    color: "#22c55e",
    pdu: "Segment (TCP) / Datagram (UDP)",
    short: "ส่งให้ครบ ถูกลำดับ และถึงถูกแอป",
    func: "รับผิดชอบการส่งข้อมูลแบบ end-to-end ระหว่างสองโฮสต์ งานหลักคือ Segmentation (ซอยข้อมูลใหญ่เป็นชิ้นเล็ก) การใส่หมายเลข Port เพื่อบอกว่าข้อมูลนี้เป็นของแอปไหน, Flow Control (คุมความเร็วไม่ให้ผู้รับรับไม่ทัน), Error Control และการส่งซ้ำเมื่อข้อมูลหาย (เฉพาะ TCP)",
    protocols: ["TCP (เชื่อถือได้ มี 3-way handshake)", "UDP (เร็ว ไม่รับประกัน)", "SCTP", "QUIC (ทำงานบน UDP)"],
    devices: ["Firewall ที่กรองตาม Port", "Load Balancer แบบ Layer 4", "Gateway"],
    remember: "เห็นคำว่า Port / TCP / UDP / ส่งซ้ำ / Flow control → Layer 4"
  },
  {
    num: 3,
    name: "Network",
    thai: "ชั้นเครือข่าย",
    color: "#3b82f6",
    pdu: "Packet",
    short: "คนวางเส้นทาง ข้ามเครือข่ายด้วย IP",
    func: "หาเส้นทาง (Routing) ให้ข้อมูลเดินทางข้ามหลายเครือข่ายจนถึงปลายทาง ใช้ Logical Address คือ IP Address เป็นตัวระบุต้นทางและปลายทาง งานอื่นได้แก่ Fragmentation (ซอย packet ให้พอดีกับ MTU) และการนับ TTL เพื่อไม่ให้ข้อมูลวนไม่รู้จบ",
    protocols: ["IPv4 / IPv6", "ICMP (ping)", "ARP*", "OSPF, BGP, RIP, EIGRP", "IPsec"],
    devices: ["Router", "Layer 3 Switch (Multilayer Switch)", "Firewall ที่กรองตาม IP"],
    remember: "เห็น IP address / Router / การเลือกเส้นทาง → Layer 3  (*ARP มักถูกจัดคาบเกี่ยว L2–L3)"
  },
  {
    num: 2,
    name: "Data Link",
    thai: "ชั้นเชื่อมโยงข้อมูล",
    color: "#8b5cf6",
    pdu: "Frame",
    short: "ส่งภายในวงแลนเดียวกันด้วย MAC Address",
    func: "รับผิดชอบการส่งข้อมูลระหว่างอุปกรณ์ที่อยู่วงเดียวกัน (hop ต่อ hop) ใช้ Physical Address คือ MAC Address แบ่งเป็น 2 ชั้นย่อยคือ LLC (คุยกับชั้นบน) และ MAC (คุมการเข้าใช้สื่อกลาง เช่น CSMA/CD) และตรวจสอบข้อผิดพลาดของเฟรมด้วย FCS/CRC ที่อยู่ใน Trailer",
    protocols: ["Ethernet (IEEE 802.3)", "Wi-Fi (IEEE 802.11)", "PPP", "HDLC", "Frame Relay", "STP", "VLAN (802.1Q)"],
    devices: ["Switch", "Bridge", "NIC (การ์ดแลน)", "Wireless Access Point"],
    remember: "เห็น MAC address / Switch / Frame / VLAN → Layer 2"
  },
  {
    num: 1,
    name: "Physical",
    thai: "ชั้นกายภาพ",
    color: "#06b6d4",
    pdu: "Bit",
    short: "สัญญาณจริงบนสาย คลื่น หรือแสง",
    func: "แปลงข้อมูลเป็นสัญญาณจริงและส่งออกไปบนสื่อกลาง เป็นเรื่องของฮาร์ดแวร์ล้วน ๆ เช่น ระดับแรงดันไฟฟ้า ความถี่คลื่นวิทยุ พัลส์แสง ชนิดหัวต่อ (RJ-45) การเข้ารหัสสัญญาณ (Manchester) และอัตราการส่งข้อมูล (bit rate)",
    protocols: ["Ethernet Physical (10BASE-T, 1000BASE-T)", "RS-232", "DSL", "USB (ชั้นกายภาพ)", "Bluetooth Radio", "Fiber Optic"],
    devices: ["Hub", "Repeater", "สายเคเบิล UTP / Fiber", "Modem", "Connector RJ-45", "Transceiver"],
    remember: "เห็น สาย / สัญญาณ / Hub / Repeater / bit → Layer 1"
  }
];

/* -------------------------------------------------------------------------
   2) ตารางเปรียบเทียบ OSI (7 ชั้น) กับ TCP/IP (4 ชั้น)
   ------------------------------------------------------------------------- */
const MODEL_COMPARE = [
  {
    tcpip: "Application Layer",
    osi: ["7. Application", "6. Presentation", "5. Session"],
    color: "#ef4444",
    note: "TCP/IP ยุบ 3 ชั้นบนของ OSI รวมเป็นชั้นเดียว เพราะในทางปฏิบัติโปรโตคอลอย่าง HTTP หรือ SMTP ทำงานทั้งสามอย่างในตัวเอง",
    proto: "HTTP, HTTPS, FTP, DNS, SMTP, DHCP, SSH"
  },
  {
    tcpip: "Transport Layer",
    osi: ["4. Transport"],
    color: "#22c55e",
    note: "ตรงกันแบบหนึ่งต่อหนึ่งกับ OSI ทำหน้าที่เดียวกันคือ end-to-end delivery และจัดการ Port",
    proto: "TCP, UDP"
  },
  {
    tcpip: "Internet Layer",
    osi: ["3. Network"],
    color: "#3b82f6",
    note: "ตรงกับ Layer 3 ของ OSI เปลี่ยนแค่ชื่อเรียก เน้นการกำหนดที่อยู่เชิงตรรกะและการ routing",
    proto: "IP, ICMP, ARP, IGMP, IPsec"
  },
  {
    tcpip: "Network Access Layer (Link)",
    osi: ["2. Data Link", "1. Physical"],
    color: "#8b5cf6",
    note: "TCP/IP รวม 2 ชั้นล่างเข้าด้วยกัน เพราะมองว่าเป็นเรื่องของการเข้าถึงสื่อกลางเหมือนกัน",
    proto: "Ethernet, Wi-Fi, PPP, DSL"
  }
];

/* -------------------------------------------------------------------------
   3) เทคนิคช่วยจำ (Mnemonic)
   ------------------------------------------------------------------------- */
const MNEMONICS = [
  {
    dir: "Layer 7 → 1 (บนลงล่าง)",
    phrase: "All People Seem To Need Data Processing",
    words: ["All", "People", "Seem", "To", "Need", "Data", "Processing"],
    layers: ["Application", "Presentation", "Session", "Transport", "Network", "Data Link", "Physical"]
  },
  {
    dir: "Layer 1 → 7 (ล่างขึ้นบน)",
    phrase: "Please Do Not Throw Sausage Pizza Away",
    words: ["Please", "Do", "Not", "Throw", "Sausage", "Pizza", "Away"],
    layers: ["Physical", "Data Link", "Network", "Transport", "Session", "Presentation", "Application"]
  }
];

/* เทคนิคจำ PDU จากล่างขึ้นบน */
const PDU_MNEMONIC = {
  phrase: "Bit → Frame → Packet → Segment → Data",
  note: "ท่องจากล่างขึ้นบน: บิต (L1) เฟรม (L2) แพ็กเก็ต (L3) เซกเมนต์ (L4) แล้ว L5–L7 เป็น Data ทั้งหมด"
};

/* -------------------------------------------------------------------------
   4) ขั้นตอน Encapsulation / Decapsulation
   ย้ายไปอยู่ในไฟล์ encap.js แล้ว เพราะเวอร์ชันใหม่จำลองการส่งข้อมูลผ่าน
   Switch และ Router จริง ๆ พร้อมแยกรายละเอียด header ตามโหมด TCP/UDP
   ดูฟังก์ชัน buildEncapSteps() ในไฟล์นั้นแทน
   ------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------
   5) ตาราง Protocol และ Port Number
   ------------------------------------------------------------------------- */
const PROTOCOLS = [
  { name: "HTTP",        full: "HyperText Transfer Protocol",           layer: 7, port: "80",        tp: "TCP",     desc: "รับส่งหน้าเว็บแบบไม่เข้ารหัส" },
  { name: "HTTPS",       full: "HTTP Secure (HTTP over TLS)",           layer: 7, port: "443",       tp: "TCP",     desc: "หน้าเว็บที่เข้ารหัสด้วย TLS" },
  { name: "FTP",         full: "File Transfer Protocol",                layer: 7, port: "20 / 21",   tp: "TCP",     desc: "21 = ช่องคำสั่ง (control), 20 = ช่องข้อมูล (data)" },
  { name: "SFTP",        full: "SSH File Transfer Protocol",            layer: 7, port: "22",        tp: "TCP",     desc: "โอนไฟล์ผ่านช่องทาง SSH" },
  { name: "TFTP",        full: "Trivial File Transfer Protocol",        layer: 7, port: "69",        tp: "UDP",     desc: "โอนไฟล์แบบง่าย ไม่ต้องล็อกอิน" },
  { name: "SSH",         full: "Secure Shell",                          layer: 7, port: "22",        tp: "TCP",     desc: "รีโมตเข้าเครื่องแบบเข้ารหัส" },
  { name: "Telnet",      full: "Telnet",                                layer: 7, port: "23",        tp: "TCP",     desc: "รีโมตแบบ plaintext ไม่ปลอดภัย" },
  { name: "SMTP",        full: "Simple Mail Transfer Protocol",         layer: 7, port: "25 / 587",  tp: "TCP",     desc: "ส่งอีเมลออก" },
  { name: "POP3",        full: "Post Office Protocol v3",               layer: 7, port: "110 / 995", tp: "TCP",     desc: "ดึงอีเมลลงเครื่องแล้วลบจากเซิร์ฟเวอร์" },
  { name: "IMAP",        full: "Internet Message Access Protocol",      layer: 7, port: "143 / 993", tp: "TCP",     desc: "อ่านอีเมลโดยเก็บไว้บนเซิร์ฟเวอร์" },
  { name: "DNS",         full: "Domain Name System",                    layer: 7, port: "53",        tp: "UDP/TCP", desc: "แปลงชื่อโดเมนเป็น IP (ใช้ TCP เมื่อข้อมูลใหญ่)" },
  { name: "DHCP",        full: "Dynamic Host Configuration Protocol",   layer: 7, port: "67 / 68",   tp: "UDP",     desc: "67 = server, 68 = client แจก IP อัตโนมัติ" },
  { name: "SNMP",        full: "Simple Network Management Protocol",    layer: 7, port: "161 / 162", tp: "UDP",     desc: "มอนิเตอร์อุปกรณ์เครือข่าย (162 = trap)" },
  { name: "NTP",         full: "Network Time Protocol",                 layer: 7, port: "123",       tp: "UDP",     desc: "ซิงค์เวลานาฬิกาของเครื่อง" },
  { name: "LDAP",        full: "Lightweight Directory Access Protocol", layer: 7, port: "389 / 636", tp: "TCP",     desc: "ค้นข้อมูลไดเรกทอรี เช่น Active Directory" },
  { name: "SMB",         full: "Server Message Block",                  layer: 7, port: "445",       tp: "TCP",     desc: "แชร์ไฟล์และเครื่องพิมพ์บน Windows" },
  { name: "RDP",         full: "Remote Desktop Protocol",               layer: 7, port: "3389",      tp: "TCP",     desc: "รีโมตเดสก์ท็อปของ Windows" },
  { name: "SSL / TLS",   full: "Transport Layer Security",              layer: 6, port: "—",         tp: "—",       desc: "เข้ารหัสข้อมูล มักถูกจัดที่ L6 (บางตำราจัด L4–L5)" },
  { name: "JPEG / MPEG", full: "รูปแบบไฟล์ภาพและวิดีโอ",                layer: 6, port: "—",         tp: "—",       desc: "การเข้ารหัสรูปแบบสื่อ" },
  { name: "NetBIOS",     full: "Network Basic Input/Output System",     layer: 5, port: "137–139",   tp: "TCP/UDP", desc: "จัดการเซสชันชื่อเครื่องบน LAN" },
  { name: "RPC",         full: "Remote Procedure Call",                 layer: 5, port: "135",       tp: "TCP",     desc: "เรียกฟังก์ชันข้ามเครื่อง" },
  { name: "TCP",         full: "Transmission Control Protocol",         layer: 4, port: "—",         tp: "TCP",     desc: "เชื่อถือได้ มี handshake เรียงลำดับ ส่งซ้ำได้" },
  { name: "UDP",         full: "User Datagram Protocol",                layer: 4, port: "—",         tp: "UDP",     desc: "เร็ว โอเวอร์เฮดต่ำ ไม่รับประกันว่าจะถึง" },
  { name: "QUIC",        full: "Quick UDP Internet Connections",        layer: 4, port: "443",       tp: "UDP",     desc: "ฐานของ HTTP/3 ทำงานบน UDP" },
  { name: "IP",          full: "Internet Protocol (v4 / v6)",           layer: 3, port: "—",         tp: "—",       desc: "กำหนดที่อยู่เชิงตรรกะและการ routing" },
  { name: "ICMP",        full: "Internet Control Message Protocol",     layer: 3, port: "—",         tp: "—",       desc: "ส่งข้อความควบคุมและแจ้งข้อผิดพลาด เช่น ping" },
  { name: "ARP",         full: "Address Resolution Protocol",           layer: 3, port: "—",         tp: "—",       desc: "แปลง IP เป็น MAC (คาบเกี่ยว L2–L3)" },
  { name: "OSPF",        full: "Open Shortest Path First",              layer: 3, port: "—",         tp: "IP 89",   desc: "โปรโตคอล routing ภายในองค์กร" },
  { name: "BGP",         full: "Border Gateway Protocol",               layer: 3, port: "179",       tp: "TCP",     desc: "โปรโตคอล routing ระหว่างองค์กรหรือ ISP" },
  { name: "IPsec",       full: "Internet Protocol Security",            layer: 3, port: "500",       tp: "UDP",     desc: "เข้ารหัสระดับ IP ใช้ทำ VPN" },
  { name: "Ethernet",    full: "IEEE 802.3",                            layer: 2, port: "—",         tp: "—",       desc: "มาตรฐาน LAN แบบใช้สาย ใช้ MAC address" },
  { name: "Wi-Fi",       full: "IEEE 802.11",                           layer: 2, port: "—",         tp: "—",       desc: "มาตรฐาน LAN ไร้สาย" },
  { name: "PPP",         full: "Point-to-Point Protocol",               layer: 2, port: "—",         tp: "—",       desc: "เชื่อมต่อแบบจุดต่อจุด เช่น สาย WAN" },
  { name: "STP",         full: "Spanning Tree Protocol",                layer: 2, port: "—",         tp: "—",       desc: "ป้องกัน loop ในเครือข่ายสวิตช์" },
  { name: "VLAN",        full: "IEEE 802.1Q",                           layer: 2, port: "—",         tp: "—",       desc: "แบ่งเครือข่ายเชิงตรรกะบนสวิตช์เดียวกัน" },
  { name: "10BASE-T",    full: "Ethernet Physical Standard",            layer: 1, port: "—",         tp: "—",       desc: "ข้อกำหนดสายและสัญญาณของ Ethernet" },
  { name: "RS-232",      full: "Serial Communication Standard",         layer: 1, port: "—",         tp: "—",       desc: "มาตรฐานพอร์ตอนุกรม" },
  { name: "DSL",         full: "Digital Subscriber Line",               layer: 1, port: "—",         tp: "—",       desc: "ส่งข้อมูลผ่านสายโทรศัพท์" }
];

/* -------------------------------------------------------------------------
   6) ตารางเทียบ TCP vs UDP (ออกสอบบ่อยมาก)
   ------------------------------------------------------------------------- */
const TCP_UDP = [
  { topic: "ประเภทการเชื่อมต่อ",  tcp: "Connection-oriented (ต้องจับมือก่อน)",       udp: "Connectionless (ส่งได้เลย)" },
  { topic: "ความน่าเชื่อถือ",      tcp: "รับประกันว่าถึง มี ACK และการส่งซ้ำ",         udp: "ไม่รับประกัน หายก็หายเลย" },
  { topic: "การเรียงลำดับ",        tcp: "เรียงลำดับให้ด้วย Sequence Number",          udp: "ไม่เรียงลำดับให้" },
  { topic: "การเริ่มต้นเชื่อมต่อ", tcp: "3-Way Handshake (SYN, SYN-ACK, ACK)",        udp: "ไม่มี handshake" },
  { topic: "Flow / Congestion",    tcp: "มีทั้ง Flow control และ Congestion control", udp: "ไม่มี" },
  { topic: "ขนาด Header",          tcp: "20–60 ไบต์ (ใหญ่กว่า)",                      udp: "8 ไบต์ (เล็กและเบา)" },
  { topic: "ความเร็ว",             tcp: "ช้ากว่า เพราะมีโอเวอร์เฮด",                  udp: "เร็วกว่า ดีเลย์ต่ำ" },
  { topic: "PDU",                  tcp: "Segment",                                    udp: "Datagram" },
  { topic: "ตัวอย่างการใช้งาน",    tcp: "เว็บ (HTTP/HTTPS), อีเมล, โอนไฟล์, SSH",     udp: "สตรีมมิ่ง, เกมออนไลน์, VoIP, DNS, DHCP" }
];

/* -------------------------------------------------------------------------
   7) Flashcards — การ์ดคำศัพท์
   ------------------------------------------------------------------------- */
const FLASHCARDS = [
  { q: "PDU ของ Layer 1 คืออะไร?", a: "Bit — สัญญาณ 0 กับ 1 บนสื่อกลาง", tag: "PDU" },
  { q: "PDU ของ Layer 2 คืออะไร?", a: "Frame — มี MAC Header ด้านหน้าและ Trailer (FCS) ด้านหลัง", tag: "PDU" },
  { q: "PDU ของ Layer 3 คืออะไร?", a: "Packet — มี IP Header ระบุ Source IP และ Destination IP", tag: "PDU" },
  { q: "PDU ของ Layer 4 คืออะไร?", a: "Segment (สำหรับ TCP) หรือ Datagram (สำหรับ UDP)", tag: "PDU" },
  { q: "PDU ของ Layer 5, 6 และ 7 คืออะไร?", a: "Data ทั้งสามชั้น", tag: "PDU" },
  { q: "Router ทำงานที่ Layer ไหน?", a: "Layer 3 (Network) — ตัดสินใจเส้นทางด้วย IP Address", tag: "Device" },
  { q: "Switch ทำงานที่ Layer ไหน?", a: "Layer 2 (Data Link) — ส่งต่อเฟรมด้วย MAC Address (ถ้าเป็น L3 Switch จะ route ได้ด้วย)", tag: "Device" },
  { q: "Hub และ Repeater ทำงานที่ Layer ไหน?", a: "Layer 1 (Physical) — แค่ทวนสัญญาณ ไม่สนใจ address ใด ๆ", tag: "Device" },
  { q: "MAC Address ใช้ในชั้นไหน และยาวกี่บิต?", a: "Layer 2 — ยาว 48 บิต (6 ไบต์) เขียนเป็นเลขฐานสิบหก เช่น 00:1A:2B:3C:4D:5E", tag: "Address" },
  { q: "IP Address ใช้ในชั้นไหน?", a: "Layer 3 — IPv4 ยาว 32 บิต ส่วน IPv6 ยาว 128 บิต", tag: "Address" },
  { q: "Port Number ใช้ในชั้นไหน?", a: "Layer 4 (Transport) — ตัวเลข 0–65535 บอกว่าข้อมูลเป็นของแอปไหน", tag: "Address" },
  { q: "TCP ต่างจาก UDP อย่างไรในหนึ่งประโยค?", a: "TCP เชื่อถือได้แต่ช้ากว่า (มี handshake, ACK, ส่งซ้ำ) ส่วน UDP เร็วแต่ไม่รับประกันว่าข้อมูลจะถึง", tag: "TCP/UDP" },
  { q: "3-Way Handshake ประกอบด้วยอะไรบ้าง?", a: "SYN → SYN-ACK → ACK", tag: "TCP/UDP" },
  { q: "Encapsulation คืออะไร?", a: "การที่ข้อมูลถูกห่อด้วย Header เพิ่มทีละชั้น ขณะไหลจาก Layer 7 ลงไป Layer 1 ที่ฝั่งส่ง", tag: "Concept" },
  { q: "Decapsulation คืออะไร?", a: "การถอด Header ออกทีละชั้น ขณะข้อมูลไหลจาก Layer 1 ขึ้นไป Layer 7 ที่ฝั่งรับ", tag: "Concept" },
  { q: "HTTP และ HTTPS ใช้พอร์ตอะไร?", a: "HTTP = 80, HTTPS = 443 (ทั้งคู่ใช้ TCP)", tag: "Port" },
  { q: "DNS ใช้พอร์ตอะไร และใช้โปรโตคอลขนส่งอะไร?", a: "พอร์ต 53 ปกติใช้ UDP แต่เปลี่ยนไปใช้ TCP เมื่อข้อมูลตอบกลับใหญ่ หรือทำ zone transfer", tag: "Port" },
  { q: "DHCP ใช้พอร์ตอะไร?", a: "UDP 67 (ฝั่ง server) และ 68 (ฝั่ง client)", tag: "Port" },
  { q: "SSH และ Telnet ใช้พอร์ตอะไร?", a: "SSH = 22 (เข้ารหัส), Telnet = 23 (ไม่เข้ารหัส)", tag: "Port" },
  { q: "FTP ใช้พอร์ตอะไร แต่ละพอร์ตทำอะไร?", a: "21 = ช่องคำสั่ง (control), 20 = ช่องข้อมูล (data)", tag: "Port" },
  { q: "Mnemonic จำ OSI จากบนลงล่างคืออะไร?", a: "All People Seem To Need Data Processing (Layer 7 → 1)", tag: "Mnemonic" },
  { q: "Mnemonic จำ OSI จากล่างขึ้นบนคืออะไร?", a: "Please Do Not Throw Sausage Pizza Away (Layer 1 → 7)", tag: "Mnemonic" },
  { q: "การเข้ารหัสและบีบอัดข้อมูลอยู่ชั้นไหน?", a: "Layer 6 (Presentation)", tag: "Layer" },
  { q: "ชั้นไหนทำ Routing และซอย fragment ตาม MTU?", a: "Layer 3 (Network)", tag: "Layer" },
  { q: "ชั้นไหนทำ Flow control, Error recovery และ Segmentation?", a: "Layer 4 (Transport)", tag: "Layer" },
  { q: "ARP ทำหน้าที่อะไร?", a: "แปลง IP Address ให้เป็น MAC Address ภายในวงแลนเดียวกัน (คาบเกี่ยว L2–L3)", tag: "Protocol" },
  { q: "ICMP ใช้ทำอะไร?", a: "ส่งข้อความควบคุมและรายงานข้อผิดพลาดที่ Layer 3 เช่นคำสั่ง ping และ traceroute", tag: "Protocol" },
  { q: "TCP/IP Model มีกี่ชั้น อะไรบ้าง?", a: "4 ชั้น คือ Application, Transport, Internet และ Network Access", tag: "Model" },
  { q: "ชั้น Application ของ TCP/IP ตรงกับ OSI ชั้นไหนบ้าง?", a: "ตรงกับ OSI Layer 5, 6 และ 7 รวมกัน", tag: "Model" },
  { q: "Trailer (FCS/CRC) ถูกเพิ่มที่ชั้นไหน?", a: "Layer 2 (Data Link) เป็นชั้นเดียวที่เติมทั้ง Header ด้านหน้าและ Trailer ด้านหลัง", tag: "Concept" },

  /* ----- การ์ดของบทใหม่: อุปกรณ์ / ที่อยู่ / ประเภทเครือข่าย ----- */
  { q: "อุปกรณ์ใดแยก Broadcast Domain ได้?", a: "Router เท่านั้น (รวมถึง Layer 3 Switch) ส่วน Switch ธรรมดาแยกได้แค่ Collision Domain", tag: "Device" },
  { q: "Switch แยกอะไรได้ และแยกอะไรไม่ได้?", a: "แยก Collision Domain ได้ทุกพอร์ต แต่หยุด Broadcast ไม่ได้ ทุกพอร์ตยังอยู่ broadcast domain เดียวกัน (ยกเว้นแบ่ง VLAN)", tag: "Device" },
  { q: "Access Point ทำงานที่ Layer ไหน?", a: "Layer 2 เพราะแปลงและส่งต่อเฟรมด้วย MAC Address ระหว่างมาตรฐาน 802.11 กับ 802.3", tag: "Device" },
  { q: "อุปกรณ์ใดทำงานได้ครบถึง Layer 7?", a: "Gateway — เชื่อมสองระบบที่ใช้โปรโตคอลต่างกัน จึงต้องแปลงข้อมูลได้ถึงระดับแอปพลิเคชัน", tag: "Device" },
  { q: "Wi-Fi ใช้กลไกอะไรแทน CSMA/CD?", a: "CSMA/CA เพราะสัญญาณไร้สายตรวจจับการชนกันโดยตรงไม่ได้ จึงต้องเลี่ยงการชนแทน", tag: "Device" },
  { q: "IPv4 กับ IPv6 ยาวกี่บิต?", a: "IPv4 = 32 บิต (ราว 4.3 พันล้านที่อยู่) ส่วน IPv6 = 128 บิต (ราว 3.4 × 10³⁸ ที่อยู่)", tag: "Address" },
  { q: "ช่วง Private IP ทั้งสามช่วงคืออะไร?", a: "10.0.0.0/8, 172.16.0.0/12 และ 192.168.0.0/16 ตาม RFC 1918", tag: "Address" },
  { q: "เห็น IP 169.254.x.x แปลว่าอะไร?", a: "APIPA — เครื่องขอ IP จาก DHCP ไม่สำเร็จ จึงตั้งเลขนี้ให้ตัวเอง แปลว่า DHCP หรือสายมีปัญหา", tag: "Address" },
  { q: "/26 คิดเป็น subnet mask อะไร และมี host กี่ตัว?", a: "255.255.255.192 มี 64 ที่อยู่ ใช้เป็น host ได้จริง 62 ตัว", tag: "Subnet" },
  { q: "สูตรหาจำนวน host ที่ใช้ได้จาก prefix คืออะไร?", a: "2^(32−prefix) − 2 โดยหัก network address กับ broadcast address ออก", tag: "Subnet" },
  { q: "OUI คืออะไร อยู่ส่วนไหนของ MAC?", a: "Organizationally Unique Identifier คือ 24 บิตแรกของ MAC ที่ IEEE ออกให้ผู้ผลิต ดู 3 ไบต์แรกก็รู้ยี่ห้อ", tag: "Address" },
  { q: "MAC Address สำหรับ Broadcast คือเลขอะไร?", a: "FF:FF:FF:FF:FF:FF ส่งถึงทุกเครื่องในวงแลนเดียวกัน", tag: "Address" },
  { q: "กฎการย่อ IPv6 มีอะไรบ้าง?", a: "1) ตัดเลขศูนย์นำหน้าของแต่ละกลุ่ม 2) ยุบกลุ่มศูนย์ที่ติดกันด้วย :: ซึ่งใช้ได้ครั้งเดียวต่อหนึ่งที่อยู่", tag: "Address" },
  { q: "เรียงลำดับขนาดเครือข่ายจากเล็กไปใหญ่", a: "PAN < LAN < CAN < MAN < WAN โดยยิ่งกว้างยิ่งช้าและดีเลย์สูงขึ้น", tag: "Network" },
  { q: "Topology แบบใดใช้จริงมากที่สุดในปัจจุบัน?", a: "Star (และ Tree ซึ่งคือ Star หลายวงต่อกันเป็นลำดับชั้น) เพราะสายเส้นเดียวขาดกระทบแค่เครื่องเดียว", tag: "Topology" },
  { q: "Full Mesh ที่มี n เครื่อง ต้องใช้สายกี่เส้น?", a: "n(n−1)/2 เส้น เช่น 5 เครื่องใช้ 10 เส้น และ 10 เครื่องใช้ถึง 45 เส้น", tag: "Topology" },
  { q: "จุดอ่อนของ Bus Topology คืออะไร?", a: "สายแกนกลางขาดจุดเดียว เครือข่ายล่มทั้งระบบ และหาจุดเสียยากมาก", tag: "Topology" },
  { q: "TTL ใน IP Header มีไว้ทำอะไร?", a: "นับจำนวน hop ที่เหลือ ลดลง 1 ทุกครั้งที่ผ่าน Router ถ้าเหลือ 0 จะถูกทิ้ง เพื่อกัน packet วนไม่รู้จบ", tag: "Concept" }
];
