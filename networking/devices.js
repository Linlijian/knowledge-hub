/* =========================================================================
   devices.js — คลังข้อมูลอุปกรณ์เครือข่าย (หน้า Network Devices)
   ใช้ pattern เดียวกับ data.js คือเก็บเฉพาะเนื้อหา ไม่มี logic แสดงผล
   - layer  : ผูกกับหมายเลขชั้นใน OSI_LAYERS เพื่อให้ดึงสีประจำชั้นมาใช้ได้ตรงกัน
   - icon   : SVG ง่าย ๆ วาดด้วย stroke=currentColor จะได้เปลี่ยนสีตามชั้นได้
   ========================================================================= */

const DEVICES = [
  {
    id: "hub",
    name: "Hub",
    thai: "ฮับ",
    layer: 1,
    tagline: "ทวนสัญญาณแล้วกระจายออกทุกพอร์ต ไม่ฉลาดเลย",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2.5" y="9.5" width="19" height="6" rx="1.6"/>
      <path d="M6 9.5V5M10 9.5V5M14 9.5V5M18 9.5V5M6 15.5V20M10 15.5V20M14 15.5V20M18 15.5V20"/>
    </svg>`,
    func: "รับสัญญาณไฟฟ้าที่เข้ามาทางพอร์ตหนึ่ง ขยายให้แรงขึ้น แล้วส่งออกไปทุกพอร์ตที่เหลือโดยไม่สนใจว่าปลายทางคือใคร เพราะ Hub อ่าน MAC Address ไม่เป็น มันเห็นข้อมูลเป็นแค่สัญญาณไฟฟ้าเท่านั้น",
    how: [
      "ทำงานแบบ Half-duplex คือรับกับส่งพร้อมกันไม่ได้",
      "ทุกพอร์ตอยู่ใน Collision Domain เดียวกัน ยิ่งต่อเยอะยิ่งชนกันเยอะ",
      "ใช้ CSMA/CD คอยตรวจการชนกันของสัญญาณ",
      "แบนด์วิดท์ถูกหารแบ่งกันระหว่างทุกเครื่องที่ต่ออยู่"
    ],
    example: "ห้องแล็บคอมพิวเตอร์รุ่นเก่าที่ต่อ 8 เครื่องเข้า Hub ตัวเดียว ปัจจุบันแทบไม่มีใช้แล้วเพราะถูก Switch แทนที่ทั้งหมด",
    collision: "1 โดเมน (ทุกพอร์ตรวมกัน)",
    broadcast: "1 โดเมน"
  },
  {
    id: "repeater",
    name: "Repeater",
    thai: "รีพีตเตอร์",
    layer: 1,
    tagline: "ยืดระยะสายให้ไกลขึ้น ด้วยการทวนสัญญาณที่อ่อนลง",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <rect x="7" y="8" width="10" height="8" rx="2"/>
      <path d="M4.5 9.5a4 4 0 0 0 0 5M2 7.5a7.5 7.5 0 0 0 0 9M19.5 9.5a4 4 0 0 1 0 5M22 7.5a7.5 7.5 0 0 1 0 9"/>
    </svg>`,
    func: "สัญญาณที่วิ่งไปตามสายจะอ่อนลงเรื่อย ๆ ตามระยะทาง (attenuation) Repeater ทำหน้าที่รับสัญญาณที่เริ่มอ่อนแล้วสร้างขึ้นมาใหม่ให้แรงเท่าเดิม เพื่อให้ส่งต่อไปได้ไกลกว่าข้อจำกัดของสายเส้นเดียว",
    how: [
      "สาย UTP มาตรฐานวิ่งได้ไกลสุด 100 เมตร ถ้าต้องไกลกว่านั้นต้องมีตัวทวนสัญญาณ",
      "ทวนเฉพาะสัญญาณ ไม่ได้อ่านหรือกรองข้อมูลใด ๆ",
      "ถ้าสัญญาณที่เข้ามามี noise ปนอยู่ ก็จะขยาย noise ตามไปด้วย",
      "Wi-Fi Extender ที่ใช้ตามบ้านคือ Repeater เวอร์ชันไร้สาย"
    ],
    example: "เดินสายจากตึก A ไปตึก B ที่ห่างกัน 150 เมตร ต้องมี Repeater คั่นกลาง หรือใช้ Wi-Fi Extender ขยายสัญญาณไปห้องมุมบ้านที่สัญญาณไปไม่ถึง",
    collision: "1 โดเมน",
    broadcast: "1 โดเมน"
  },
  {
    id: "bridge",
    name: "Bridge",
    thai: "บริดจ์",
    layer: 2,
    tagline: "เชื่อม 2 เซกเมนต์เข้าด้วยกัน และกรองด้วย MAC",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <rect x="1.5" y="8" width="7" height="8" rx="1.6"/>
      <rect x="15.5" y="8" width="7" height="8" rx="1.6"/>
      <path d="M8.5 12h7"/><circle cx="12" cy="12" r="1.4"/>
    </svg>`,
    func: "เชื่อมเครือข่าย 2 ส่วนเข้าด้วยกัน และเรียนรู้ว่า MAC Address ไหนอยู่ฝั่งไหน ถ้าข้อมูลถูกส่งไปยังเครื่องที่อยู่ฝั่งเดียวกันกับผู้ส่ง Bridge จะไม่ส่งข้ามฝั่งให้ ทำให้ทราฟฟิกไม่รบกวนกัน",
    how: [
      "มีตาราง MAC เหมือน Switch แต่มีพอร์ตน้อยมาก (ปกติ 2 พอร์ต)",
      "แยก Collision Domain ออกเป็น 2 ฝั่ง",
      "ตัดสินใจด้วยซอฟต์แวร์ จึงช้ากว่า Switch ที่ใช้ชิป ASIC",
      "ถือได้ว่า Switch คือ Bridge ที่มีหลายพอร์ตและทำงานเร็วกว่า"
    ],
    example: "สมัยก่อนใช้เชื่อมแลนสองห้องเข้าด้วยกัน ปัจจุบันเจอในรูปแบบ Wireless Bridge ที่ยิงสัญญาณเชื่อมเครือข่ายระหว่างสองอาคารแทนการเดินสาย",
    collision: "แยกตามจำนวนพอร์ต (พอร์ตละโดเมน)",
    broadcast: "1 โดเมน"
  },
  {
    id: "switch",
    name: "Switch",
    thai: "สวิตช์",
    layer: 2,
    tagline: "ส่งเฉพาะพอร์ตที่ถูกต้อง ด้วย MAC Address Table",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="6.5" width="20" height="11" rx="2"/>
      <path d="M6 10.5h9l-2.4-2.2M18 13.5H9l2.4 2.2"/>
    </svg>`,
    func: "อ่าน MAC Address ปลายทางในเฟรมที่เข้ามา แล้วเปิดดูตาราง MAC Address Table ว่าเครื่องนั้นต่ออยู่พอร์ตไหน จากนั้นส่งเฟรมออกไปเฉพาะพอร์ตนั้นพอร์ตเดียว ไม่รบกวนพอร์ตอื่น",
    how: [
      "เรียนรู้เอง: จำ MAC ต้นทางของทุกเฟรมที่วิ่งเข้ามาคู่กับหมายเลขพอร์ต",
      "ถ้ายังไม่รู้จัก MAC ปลายทาง จะทำ Flooding คือส่งออกทุกพอร์ตก่อนหนึ่งครั้ง",
      "แยก Collision Domain ให้ทุกพอร์ต จึงวิ่งแบบ Full-duplex ได้เต็มความเร็ว",
      "แบ่ง VLAN ได้ เพื่อแยกกลุ่มผู้ใช้ออกจากกันเชิงตรรกะ",
      "Layer 3 Switch (Multilayer Switch) ทำ routing ด้วย IP ได้เพิ่มจากงาน L2 ปกติ"
    ],
    example: "สวิตช์ 24 พอร์ตในตู้ Rack ของออฟฟิศ ที่ต่อคอมพิวเตอร์พนักงาน เครื่องพิมพ์ และเซิร์ฟเวอร์เข้าด้วยกัน",
    collision: "แยกทุกพอร์ต (พอร์ตละ 1 โดเมน)",
    broadcast: "1 โดเมน (หรือ 1 โดเมนต่อ 1 VLAN)"
  },
  {
    id: "ap",
    name: "Access Point",
    thai: "จุดกระจายสัญญาณไร้สาย",
    layer: 2,
    tagline: "เปลี่ยนเครือข่ายมีสายให้กลายเป็น Wi-Fi",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <rect x="7.5" y="15" width="9" height="5.5" rx="1.6"/>
      <path d="M12 15v-3M5 10.5a9.5 9.5 0 0 1 14 0M8 13a5.5 5.5 0 0 1 8 0"/>
    </svg>`,
    func: "ทำหน้าที่เหมือนสวิตช์ไร้สาย คือรับเฟรมจากอุปกรณ์ Wi-Fi (มาตรฐาน 802.11) แล้วแปลงส่งต่อเข้าเครือข่ายมีสาย (802.3) และส่งกลับทางตรงข้าม ทำงานด้วย MAC Address จึงจัดอยู่ที่ Layer 2",
    how: [
      "แปลงเฟรมระหว่างมาตรฐาน 802.11 (ไร้สาย) กับ 802.3 (Ethernet)",
      "กระจาย SSID ให้อุปกรณ์เห็นชื่อเครือข่ายและเข้ามาเชื่อมต่อ",
      "จัดการการเข้ารหัสระดับการเชื่อมต่อ เช่น WPA2 / WPA3",
      "ใช้ CSMA/CA แทน CSMA/CD เพราะสัญญาณไร้สายตรวจการชนโดยตรงไม่ได้",
      "ระวังสับสน: Access Point ล้วน ๆ ไม่ได้แจก IP และไม่ได้ทำ routing"
    ],
    example: "AP ติดเพดานตามออฟฟิศหรือมหาวิทยาลัย ที่ลากสาย LAN จากสวิตช์ขึ้นไปแล้วกระจาย Wi-Fi ให้ทั้งชั้น",
    collision: "ใช้สื่อกลางร่วมกันในย่านความถี่เดียวกัน",
    broadcast: "อยู่ใน broadcast domain เดียวกับเครือข่ายมีสายที่ต่ออยู่"
  },
  {
    id: "wrouter",
    name: "Wireless Router",
    thai: "เราเตอร์ไร้สาย",
    layer: 3,
    tagline: "รวมร่าง Router + Switch + AP ไว้ในกล่องเดียว",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2.5" y="13" width="19" height="7" rx="2"/>
      <path d="M6.5 16.5h.01M10 16.5h.01M17.5 16.5h2"/>
      <path d="M7 10a7 7 0 0 1 10 0M9.8 12.2a3.2 3.2 0 0 1 4.4 0"/>
    </svg>`,
    func: "กล่องเราเตอร์ที่ใช้ตามบ้านไม่ได้เป็นแค่ Router อย่างเดียว แต่รวมหลายอุปกรณ์ไว้ด้วยกัน คือ Router (L3) + Switch หลายพอร์ต (L2) + Access Point (L2) + เซิร์ฟเวอร์ DHCP และ NAT",
    how: [
      "ฝั่ง WAN ต่อออกอินเทอร์เน็ต ฝั่ง LAN แจกให้อุปกรณ์ในบ้าน",
      "ทำ NAT แปลง Private IP ในบ้านให้เป็น Public IP ขาออกหนึ่งเลข",
      "ทำ DHCP แจก IP ให้อุปกรณ์ที่เข้ามาเชื่อมต่ออัตโนมัติ",
      "ในข้อสอบถ้าถามว่าอุปกรณ์นี้อยู่ชั้นไหน ให้ตอบตามงานหลักคือ Layer 3"
    ],
    example: "เราเตอร์ Wi-Fi ที่ผู้ให้บริการอินเทอร์เน็ตติดตั้งให้ที่บ้าน มีทั้งช่องเสียบสาย LAN 4 ช่องและปล่อย Wi-Fi ในตัว",
    collision: "แยกทุกพอร์ตในส่วนที่เป็นสวิตช์",
    broadcast: "แยก broadcast domain ระหว่างฝั่ง LAN กับ WAN"
  },
  {
    id: "router",
    name: "Router",
    thai: "เราเตอร์",
    layer: 3,
    tagline: "เลือกเส้นทางข้ามเครือข่ายด้วย Routing Table และ IP",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="12.5" width="20" height="7.5" rx="2"/>
      <path d="M8 9.5V3.5M8 3.5L5.5 6M8 3.5l2.5 2.5M16 3.5v6M16 9.5L13.5 7M16 9.5l2.5-2.5"/>
    </svg>`,
    func: "อ่าน IP Address ปลายทางใน Packet แล้วเทียบกับ Routing Table เพื่อตัดสินใจว่าจะส่งออกทางอินเทอร์เฟซไหน เป็นอุปกรณ์ที่ทำให้เครือข่ายคนละวงคุยกันได้ และเป็นตัวที่หยุดการกระจาย broadcast",
    how: [
      "แกะเฟรมออกถึงชั้น 3 เพื่ออ่าน IP แล้วห่อเฟรมชั้น 2 ใหม่ก่อนส่งต่อ",
      "ลดค่า TTL ลง 1 ทุกครั้งที่ผ่าน ถ้าเหลือ 0 จะทิ้ง packet ทิ้ง",
      "MAC ต้นทาง–ปลายทางเปลี่ยนทุก hop แต่ IP ต้นทาง–ปลายทางไม่เปลี่ยน",
      "แยก Broadcast Domain ออกจากกัน จึงลดทราฟฟิกขยะในเครือข่ายใหญ่",
      "ใช้โปรโตคอลอย่าง OSPF, BGP, RIP เพื่อเรียนรู้เส้นทางอัตโนมัติ"
    ],
    example: "เราเตอร์ที่เชื่อมเครือข่ายสำนักงานสาขากรุงเทพกับสาขาเชียงใหม่ หรือเราเตอร์ของ ISP ที่ส่งต่อทราฟฟิกออกสู่อินเทอร์เน็ต",
    collision: "แยกทุกอินเทอร์เฟซ",
    broadcast: "แยกทุกอินเทอร์เฟซ (จุดเด่นที่สุดของ Router)"
  },
  {
    id: "firewall",
    name: "Firewall",
    thai: "ไฟร์วอลล์",
    layer: 3,
    tagline: "ยามเฝ้าประตู กรองทราฟฟิกตามกฎที่ตั้งไว้",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2.5" y="4.5" width="19" height="15" rx="2"/>
      <path d="M2.5 9.5h19M2.5 14.5h19M9 4.5v5M15 9.5v5M9 14.5v5"/>
    </svg>`,
    func: "ตรวจทราฟฟิกที่วิ่งผ่านแล้วตัดสินใจว่าจะปล่อยผ่านหรือบล็อก ตามกฎที่ผู้ดูแลตั้งไว้ ทำงานได้หลายชั้นขึ้นกับชนิด ตั้งแต่กรองด้วย IP (L3) กรองด้วย Port (L4) ไปจนถึงอ่านเนื้อหาระดับแอป (L7)",
    how: [
      "Packet Filter — กรองด้วย IP ต้นทาง/ปลายทาง ที่ Layer 3",
      "Stateful Firewall — จำสถานะการเชื่อมต่อ ทำงานที่ Layer 4 ด้วย",
      "Next-Gen Firewall (NGFW) — อ่านถึงเนื้อหาแอปพลิเคชันที่ Layer 7",
      "ในข้อสอบมักตอบว่าอยู่ Layer 3–4 ถ้าไม่ได้ระบุว่าเป็น NGFW"
    ],
    example: "ไฟร์วอลล์หน้าองค์กรที่ตั้งกฎว่าอนุญาตเฉพาะพอร์ต 80 กับ 443 ออกอินเทอร์เน็ต และบล็อกพอร์ต 23 (Telnet) ทั้งหมด",
    collision: "—",
    broadcast: "แยกโดเมนเมื่อทำงานเป็น Layer 3"
  },
  {
    id: "gateway",
    name: "Gateway",
    thai: "เกตเวย์",
    layer: 7,
    tagline: "ล่ามแปลภาษา เชื่อมสองระบบที่คุยกันคนละโปรโตคอล",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 20V8.5L12 3l9 5.5V20"/>
      <path d="M3 20h18M9.5 20v-6h5v6"/>
    </svg>`,
    func: "จุดเชื่อมระหว่างเครือข่ายสองระบบที่ใช้โปรโตคอลต่างกัน ทำหน้าที่แปลงรูปแบบข้อมูลให้ทั้งสองฝั่งเข้าใจกันได้ ถือเป็นอุปกรณ์ที่ทำงานได้ครบทุกชั้นจนถึง Layer 7",
    how: [
      "แปลงโปรโตคอล เช่น จากระบบโทรศัพท์เดิมมาเป็น VoIP",
      "คำว่า Default Gateway ที่ตั้งในเครื่องเรา หมายถึง IP ของ Router ที่เป็นทางออกของวงแลน",
      "อุปกรณ์เดียวอาจทำหน้าที่ทั้ง Router และ Gateway ในเวลาเดียวกัน",
      "ในข้อสอบ ถ้าถามว่าอุปกรณ์ใดทำงานได้ถึง Layer 7 คำตอบมักคือ Gateway"
    ],
    example: "VoIP Gateway ที่เชื่อมสายโทรศัพท์แบบเดิมเข้ากับระบบโทรผ่านอินเทอร์เน็ต หรือ API Gateway ที่แปลงคำขอจากภายนอกให้ระบบภายในเข้าใจ",
    collision: "—",
    broadcast: "แยกโดเมน"
  }
];

/* -------------------------------------------------------------------------
   ตารางสรุป Collision Domain / Broadcast Domain (โจทย์ยอดฮิต)
   ------------------------------------------------------------------------- */
const DOMAIN_TABLE = [
  { dev: "Hub / Repeater",  layer: 1, coll: "1 โดเมน รวมทุกพอร์ต",      bcast: "1 โดเมน",                 note: "ไม่อ่าน address ใด ๆ เลย" },
  { dev: "Bridge",          layer: 2, coll: "1 โดเมนต่อ 1 พอร์ต",        bcast: "1 โดเมน",                 note: "กรองด้วย MAC แต่พอร์ตน้อย" },
  { dev: "Switch",          layer: 2, coll: "1 โดเมนต่อ 1 พอร์ต",        bcast: "1 โดเมน (หรือ 1 ต่อ VLAN)", note: "แยก collision ได้ แต่ไม่หยุด broadcast" },
  { dev: "Access Point",    layer: 2, coll: "ใช้สื่อกลางร่วมกัน",         bcast: "รวมกับวงแลนที่ต่ออยู่",     note: "ใช้ CSMA/CA แทน CSMA/CD" },
  { dev: "Router",          layer: 3, coll: "1 โดเมนต่อ 1 อินเทอร์เฟซ",  bcast: "1 โดเมนต่อ 1 อินเทอร์เฟซ", note: "อุปกรณ์เดียวที่หยุด broadcast ได้" }
];

/* -------------------------------------------------------------------------
   ผังเครือข่ายตัวอย่าง (ออฟฟิศเล็ก) สำหรับ interactive diagram
   พิกัดอ้างอิงกับ viewBox "0 0 900 430"
   - kind : cloud | device | endpoint  ใช้เลือกวิธีวาดรูป
   - dev  : id ที่ตรงกับ DEVICES เพื่อดึงรายละเอียดมาแสดงตอนคลิก
   ------------------------------------------------------------------------- */
const TOPO_MAP = {
  viewBox: "0 0 900 430",
  nodes: [
    { id: "net",      label: "Internet / ISP", kind: "cloud",    x: 80,  y: 60,  layer: null, dev: null,
      info: "โลกภายนอกที่อยู่นอกเหนือการควบคุมของเรา ทราฟฟิกทุกอย่างที่ออกไปข้างนอกต้องผ่านอุปกรณ์ขอบเครือข่ายก่อนเสมอ" },
    { id: "fw",       label: "Firewall",       kind: "device",   x: 290, y: 60,  layer: 3, dev: "firewall",
      info: "ด่านแรกขององค์กร กรองว่าทราฟฟิกไหนเข้าออกได้บ้าง ตั้งกฎด้วย IP และ Port เป็นหลัก" },
    { id: "rt",       label: "Router",         kind: "device",   x: 500, y: 60,  layer: 3, dev: "router",
      info: "ทางออกของวงแลนนี้ (Default Gateway) ใช้ Routing Table เลือกเส้นทาง และแยก broadcast domain ระหว่างในกับนอก" },
    { id: "sw",       label: "Switch",         kind: "device",   x: 500, y: 200, layer: 2, dev: "switch",
      info: "ศูนย์กลางของวงแลน ส่งเฟรมไปเฉพาะพอร์ตที่ถูกต้องด้วย MAC Address Table แยก collision domain ให้ทุกพอร์ต" },
    { id: "ap",       label: "Access Point",   kind: "device",   x: 730, y: 200, layer: 2, dev: "ap",
      info: "แปลงเครือข่ายมีสายให้เป็น Wi-Fi อุปกรณ์ไร้สายทุกตัวยังอยู่ในวงแลนเดียวกับเครื่องที่ต่อสาย" },
    { id: "hub",      label: "Hub (เก่า)",     kind: "device",   x: 250, y: 200, layer: 1, dev: "hub",
      info: "เซกเมนต์เก่าที่ยังใช้ Hub อยู่ ทุกเครื่องหลัง Hub ต้องแย่งกันใช้สัญญาณและชนกันบ่อย" },
    { id: "pc1",      label: "PC-01",          kind: "endpoint", x: 170, y: 340, layer: null, dev: null,
      info: "เครื่องที่ต่อหลัง Hub แชร์แบนด์วิดท์กับ PC-02 และเจอปัญหาการชนของสัญญาณ" },
    { id: "pc2",      label: "PC-02",          kind: "endpoint", x: 330, y: 340, layer: null, dev: null,
      info: "อีกเครื่องในเซกเมนต์ Hub เดียวกัน ถ้าส่งข้อมูลพร้อม PC-01 จะเกิด collision" },
    { id: "pc3",      label: "PC-03",          kind: "endpoint", x: 470, y: 340, layer: null, dev: null,
      info: "ต่อตรงเข้าสวิตช์ จึงได้แบนด์วิดท์เต็มพอร์ตแบบ Full-duplex ไม่ต้องแย่งกับใคร" },
    { id: "srv",      label: "Server",         kind: "endpoint", x: 600, y: 340, layer: null, dev: null,
      info: "เซิร์ฟเวอร์ในองค์กร ควรต่อตรงเข้าสวิตช์และตั้ง IP แบบคงที่ ไม่ให้ DHCP สุ่มเปลี่ยน" },
    { id: "phone",    label: "Smartphone",     kind: "endpoint", x: 700, y: 340, layer: null, dev: null,
      info: "เชื่อมแบบไร้สายผ่าน AP ได้ IP จาก DHCP ของเราเตอร์เหมือนเครื่องที่ต่อสาย" },
    { id: "laptop",   label: "Laptop",         kind: "endpoint", x: 820, y: 340, layer: null, dev: null,
      info: "อีกอุปกรณ์ไร้สาย สังเกตว่ามันคุยกับ Server ได้โดยไม่ต้องผ่าน Router เพราะอยู่วงแลนเดียวกัน" }
  ],
  links: [
    { a: "net",  b: "fw"    },
    { a: "fw",   b: "rt"    },
    { a: "rt",   b: "sw"    },
    { a: "sw",   b: "hub"   },
    { a: "sw",   b: "ap"    },
    { a: "hub",  b: "pc1"   },
    { a: "hub",  b: "pc2"   },
    { a: "sw",   b: "pc3"   },
    { a: "sw",   b: "srv"   },
    { a: "ap",   b: "phone",  wireless: true },
    { a: "ap",   b: "laptop", wireless: true }
  ]
};
