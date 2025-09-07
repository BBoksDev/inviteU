// ====== 기본 설정 ======
const EVENT_CONFIG = {
  kidName: "은우",
  kidAge: 11,

  // 일정
  dateStr: "2025-09-20T13:30:00+09:00",

  // 만남(= 헤어짐) 장소
  meetPlace: "조천청소년문화의집",
  meetAddress: "제주 제주시 조천읍 신북로 194-1",
  meetMapUrl: "https://naver.me/xCBNUtOH",

  // 파티/숙소
  partyPlace: "제주아이브리조트",
  partyAddress: "제주 서귀포시 산록남로 1966-34 아이브리조트",
  partyMapUrl: "https://naver.me/5uIMHe16",

	stuff: [
    "칫솔 등 개인 세면도구",
    "수영복 🩱(기능성옷가능)",
    "수영모 🧢(일반모자가능)",
    "잠옷 👘",
    "여벌옷 👕"
  ],

  // 연락처(엄마/아빠)
  contacts: {
    mom: { label: "엄마", name: "은우엄마", phone: "010-8347-1287", note: "" },
    dad: { label: "아빠", name: "은우아빠", phone: "010-3119-8071", note: "" }
  },
  
  // 일정
  schedule: {
	  "1일차": [
	    { time: "13:30", desc: "모임 장소 집결" },
	    { time: "14:30", desc: "리조트 체크인 & 짐 정리" },
	    { time: "15:00", desc: "물놀이 🤿" },
	    { time: "18:00", desc: "저녁 식사 & 케이크 커팅 🍰" },
	    { time: "20:00", desc: "자유 시간 (보드게임/게임/담소)" },
	    { time: "23:00", desc: "취침 🛌" }
	  ],
	  "2일차": [
	    { time: "09:00", desc: "아침 식사 🍜" },
	    { time: "10:30", desc: "체크아웃 준비" },
	    { time: "11:00", desc: "리조트 체크아웃" },
	    { time: "12:00", desc: "귀가 & 헤어짐 👋" }
	  ]
	},

  // 색상 테마
  themeColors: ["#3b82f6","#22c55e","#06b6d4"],
};

document.addEventListener("DOMContentLoaded", ()=>{
  const auth = loadAuth();
  if (auth) {
    // 바로 메인 화면
    enterInvite(auth.name);
  } else {
    // 인증 화면
    $("#invite").classList.remove("active");
    $("#gate").classList.add("active");
  }
});

// 이름별 비밀번호 매핑
const GUEST_PASSWORDS = {
  "박상복": "8071",
  "장선미": "1287",
  "박시우": "5100",
  "박은우": "9025",
  "박준우": "9024",
  "김재윤": "6352",
  "김하준": "4664",
  "송승화": "4377",
  "송연우": "6175"
};

// (기존) 전달 수신자 — 고정값 → 선택형으로 대체 사용
const ORGANIZER_NAME = "은우 엄마";
const ORGANIZER_PHONE = "01083471287"; // 사용 안 해도 무방 (선택값 우선)

// ====== 유틸 ======
const $ = (sel, root=document) => root.querySelector(sel);
const fmtDateKST = (iso) => {
  const d = new Date(iso);
  const dayNames = ["일","월","화","수","목","금","토"];
  const y = d.getFullYear();
  const m = d.getMonth()+1;
  const day = d.getDate();
  const wd = dayNames[d.getDay()];
  const hh = d.getHours().toString().padStart(2,"0");
  const mm = d.getMinutes().toString().padStart(2,"0");
  return `${y}년 ${m}월 ${day}일(${wd}) ${hh}:${mm}`;
};
const onlyDigits = s => (s || "").replace(/[^0-9]/g, "");

// ====== 초기 세팅 ======
(function init(){
  // 색상 테마
  document.documentElement.style.setProperty("--primary", EVENT_CONFIG.themeColors[0] || "#3b82f6");
  document.documentElement.style.setProperty("--accent",  EVENT_CONFIG.themeColors[1] || "#22c55e");
  document.documentElement.style.setProperty("--accent-2",EVENT_CONFIG.themeColors[2] || "#06b6d4");

  $("#year").textContent = new Date().getFullYear();
  $("#kidName").textContent = `${EVENT_CONFIG.kidName}의 ${EVENT_CONFIG.kidAge}번째 생일파티에 초대합니다!`;
  
  // 장소 (한 번만)
	$("#meetWhereText").textContent = EVENT_CONFIG.meetPlace || EVENT_CONFIG.meetAddress;

	// 모이는 시간
	$("#meetWhenText").textContent  = fmtDateKST(EVENT_CONFIG.dateStr);

  // 우측: 파티/숙소
  $("#partyWhereText").textContent = EVENT_CONFIG.partyPlace || EVENT_CONFIG.partyAddress;

	// 준비물 렌더링
  const ul = document.getElementById("stuffList");
  if (ul && EVENT_CONFIG.stuff) {
    EVENT_CONFIG.stuff.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      ul.appendChild(li);
    });
  }

  // 연락처(엄마/아빠) — tel: 링크/텍스트 세팅
  const mom = EVENT_CONFIG.contacts?.mom;
  const dad = EVENT_CONFIG.contacts?.dad;
  if (mom) {
    const momA = $("#contactMom");
    momA.href = `tel:${onlyDigits(mom.phone)}`;
    momA.textContent = `${mom.name || mom.label}: ${mom.phone}${mom.note ? ` (${mom.note})` : ""}`;
  }
  if (dad) {
    const dadA = $("#contactDad");
    dadA.href = `tel:${onlyDigits(dad.phone)}`;
    dadA.textContent = `${dad.name || dad.label}: ${dad.phone}${dad.note ? ` (${dad.note})` : ""}`;
  }

  const root = document.getElementById("scheduleList");
  if (!root) return;
  root.innerHTML = ""; // 초기화

  Object.keys(EVENT_CONFIG.schedule).forEach(day => {
    // Day 제목
    const dayLi = document.createElement("li");
    dayLi.className = "schedule-day";
    dayLi.textContent = day;
    root.appendChild(dayLi);

    // Day 항목 컨테이너
    const items = document.createElement("ul");
    items.className = "schedule-items";
    root.appendChild(items);

    // 시간별 항목
    EVENT_CONFIG.schedule[day].forEach(({time, desc}) => {
      const li = document.createElement("li");
      const t = document.createElement("span");
      t.className = "schedule-time";
      t.textContent = time;
      li.appendChild(t);
      li.appendChild(document.createTextNode(" - " + desc));
      items.appendChild(li);
    });
  });
})();

// ====== 인증 로직 ======
// ==== 인증 상태 저장 + 만료 ====
const AUTH_STORAGE_KEY = "invite_auth_v1";
const AUTH_TTL_MS = 1000 * 60 * 30; // 30분

function saveAuth(name){
  const data = { name, exp: Date.now() + AUTH_TTL_MS };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
}

function loadAuth(){
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if(!raw) return null;
    const obj = JSON.parse(raw);
    if(!obj || !obj.exp || !obj.name) return null;
    if (Date.now() > obj.exp) { // 만료
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
    return obj;
  } catch { return null; }
}

function clearAuth(){
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

function enterInvite(name){
  // 헤더 문구
  $("#brandTitle").textContent = `${EVENT_CONFIG.kidName}의 생일파티 초대장`;
  $("#brandSubtitle").textContent = `${name}, 이번 내 생일파티 동료가 돼라!`;

  // 뷰 전환
  $("#gate").classList.remove("active");
  $("#invite").classList.add("active");

  // (원래 있던 축포/타이틀 등)
  document.title = `🎉 ${EVENT_CONFIG.kidName} 초대장`;
  shootConfetti();
}

const gateForm = $("#gateForm");
const gateError = $("#gateError");
const inviteView = $("#invite");
const gateView = $("#gate");

gateForm.addEventListener("submit", (e)=>{
  e.preventDefault();
  const name = ($("#guestName").value || "").trim();
  const code = ($("#code").value || "").trim();

  const password = ($("#code").value || "").trim();
	const storedPw = GUEST_PASSWORDS[name] || null;

	if (!storedPw || password !== storedPw) {
	  gateError.style.display = "block";
	  return;
	}
  gateError.style.display = "none";
  saveAuth(name);         // ✅ 인증 상태 저장(만료 포함)
  enterInvite(name);      // ✅ 메인으로 진입
});

// 개별 주소 복사
$("#copyMeetAddr").addEventListener("click", async ()=>{
  try{ await navigator.clipboard.writeText(EVENT_CONFIG.meetAddress || EVENT_CONFIG.meetPlace); alert("모임장소 주소 복사 완료!"); }
  catch{ alert("복사 실패"); }
});
$("#copyPartyAddr").addEventListener("click", async ()=>{
  try{ await navigator.clipboard.writeText(EVENT_CONFIG.partyAddress || EVENT_CONFIG.partyPlace); alert("파티장소(숙소) 주소 복사 완료!"); }
  catch{ alert("복사 실패"); }
});

// ====== 지도 열기: 버튼으로 변경됨 ======
$("#meetMapBtn").addEventListener("click", ()=>{
  const url = EVENT_CONFIG.meetMapUrl || "#";
  window.open(url, "_blank", "noopener");
});
$("#partyMapBtn").addEventListener("click", ()=>{
  const url = EVENT_CONFIG.partyMapUrl || "#";
  window.open(url, "_blank", "noopener");
});

// ====== 전달 로직 ======
function buildShareText(){
  const gateName = ($("#guestName").value || "게스트").trim();
  const note  = ($("#hostNote").value || "").trim();

  return [
    `📨 전달사항(${gateName})`,
    note ? `• 메모: ${note}` : `• 주소: \n• 메모: `
  ].filter(Boolean).join("\n");
}

// 수신자 선택/표시/번호 얻기
function getSelectedRecipient(){
  const sel = $("#recipientSelect");
  const key = sel ? sel.value : "mom";
  const contacts = EVENT_CONFIG.contacts || {};
  return contacts[key] || contacts["mom"] || { label:"", name: ORGANIZER_NAME, phone: ORGANIZER_PHONE };
}

// 문자 보내기 (선택된 수신자 번호로)
function sendViaSMS(){
  const text = buildShareText();
  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const r = getSelectedRecipient();
  const phone = (r.phone && onlyDigits(r.phone)) || onlyDigits(ORGANIZER_PHONE) || "";
  const body = encodeURIComponent(text);
  const smsUrl = isIOS ? `sms:${phone}&body=${body}` : `sms:${phone}?body=${body}`;
  try{ location.href = smsUrl; }catch{ alert("문자 앱을 열 수 없는 환경입니다. 모바일에서 이용해 주세요."); }
}

$("#btnSMS").addEventListener("click", sendViaSMS);

// ====== confetti ======
function shootConfetti(){
  const root = $("#confetti");
  const colors = [getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(),
                  getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
                  getComputedStyle(document.documentElement).getPropertyValue('--accent-2').trim(),
                  "#fbbf24", "#ef4444"];
  const N = 80;
  for(let i=0;i<N;i++){
    const p = document.createElement("span");
    p.style.left = Math.random()*100 + "vw";
    p.style.top  = - (Math.random()*30) + "vh";
    p.style.background = colors[i % colors.length];
    p.style.animationDuration = (1 + Math.random()*1.8) + "s";
    p.style.transform = `translateY(-10vh) rotate(${Math.random()*360}deg)`;
    root.appendChild(p);
    setTimeout(()=>p.remove(), 2500);
  }
}

// 쿼리 자동 채우기(선택) – 이름만 보존
(function fillFromQuery(){
  const params = new URLSearchParams(location.search);
  if(params.get("guest")) $("#guestName").value = params.get("guest");
})();
