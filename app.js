// ====== 기본 설정 ======
const EVENT_CONFIG = {
  kidName: "은우",
  kidAge: 11,

  // 일정
  dateStr: "2025-09-20T13:30:00+09:00",
  endStr:  "2025-09-21T12:00:00+09:00",

  // 만남(= 헤어짐) 장소
  meetPlace: "조천청소년문화의집",
  meetAddress: "제주 제주시 조천읍 신북로 194-1 조천청소년문화의집",
  meetMapUrl: "https://naver.me/xCBNUtOH",

  // 파티/숙소
  partyPlace: "제주아이브리조트",
  partyAddress: "제주 서귀포시 산록남로 1966-34 아이브리조트",
  partyMapUrl: "https://naver.me/5uIMHe16",

  contact: "은우엄마: 010-8347-1287 (문자 가능)",
  // hero 부제/문구/칩/상단이미지 사용 안함
  themeColors: ["#3b82f6","#22c55e","#06b6d4"],
};

const GUEST_LIST = ["박상복","장선미","박시우","박은우","박준우","김재윤","송연우","송승화","김하준"];
const INVITE_CODE = "JC5207";

// 전달 수신자(문자 번호는 고정 가능)
const ORGANIZER_NAME = "은우엄마";
const ORGANIZER_PHONE = "01083471287"; // 숫자만, 비워두면 수신자 미지정
const KAKAO_JS_KEY = "여기에_카카오_자바스크립트_키"; // Kakao.init()에 사용

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

// ====== 초기 세팅 ======
(function init(){
  // 테마
  document.documentElement.style.setProperty("--primary", EVENT_CONFIG.themeColors[0] || "#3b82f6");
  document.documentElement.style.setProperty("--accent",  EVENT_CONFIG.themeColors[1] || "#22c55e");
  document.documentElement.style.setProperty("--accent-2",EVENT_CONFIG.themeColors[2] || "#06b6d4");

  $("#year").textContent = new Date().getFullYear();
  $("#kidName").textContent = `${EVENT_CONFIG.kidName}의 ${EVENT_CONFIG.kidAge}번째 생일파티에 초대합니다!`;

  // 좌측: 만남 & 헤어짐(같은 장소)
  $("#meetWhereText").textContent  = EVENT_CONFIG.meetAddress || EVENT_CONFIG.meetPlace;
  $("#meetWhenText").textContent   = fmtDateKST(EVENT_CONFIG.dateStr);
  $("#meetMapLink").href           = EVENT_CONFIG.meetMapUrl || "#";

  $("#leaveWhereText").textContent = EVENT_CONFIG.meetAddress || EVENT_CONFIG.meetPlace;
  $("#leaveWhenText").textContent  = fmtDateKST(EVENT_CONFIG.endStr);
  $("#leaveMapLink").href          = EVENT_CONFIG.meetMapUrl || "#";

  // 우측: 파티/숙소
  $("#partyWhereText").textContent = EVENT_CONFIG.partyAddress || EVENT_CONFIG.partyPlace;
  $("#partyMapLink").href          = EVENT_CONFIG.partyMapUrl || "#";

  // 연락처
  $("#contactText").textContent = EVENT_CONFIG.contact;
	// 연락처 세팅
	$("#contactLink").href = `tel:${ORGANIZER_PHONE}`;


  // 전달 수신자 표시
  $("#hostDisplay").textContent = `${ORGANIZER_NAME}${ORGANIZER_PHONE ? ` · ${ORGANIZER_PHONE}` : ""}`;

  // Kakao SDK init (실키로 교체!)
  try {
    if (KAKAO_JS_KEY && window.Kakao && !Kakao.isInitialized()) Kakao.init(KAKAO_JS_KEY);
    console.log("Kakao initialized:", Kakao?.isInitialized?.());
  } catch (e) { console.warn("Kakao init error:", e); }
})();

// ====== 인증 로직 ======
const gateForm = $("#gateForm");
const gateError = $("#gateError");
const inviteView = $("#invite");
const gateView = $("#gate");

gateForm.addEventListener("submit", (e)=>{
  e.preventDefault();
  const name = ($("#guestName").value || "").trim();
  const code = ($("#code").value || "").trim();

  const matchName = name ? GUEST_LIST.some(n => n.toLowerCase() === name.toLowerCase()) : false;
  const matchCode = code ? (code.toUpperCase() === INVITE_CODE.toUpperCase()) : false;

  if(!matchName || !matchCode){
    gateError.style.display="block";
    return;
  }
  gateError.style.display="none";
  gateView.classList.remove("active");
  inviteView.classList.add("active");
  document.title = `🎉 ${EVENT_CONFIG.kidName} 초대장`;

  $("#attendInfo").textContent = `${name}님, 참석 예정으로 기록했어요.`;
  shootConfetti();

  history.replaceState(null,"", location.pathname + `?guest=${encodeURIComponent(name)}`);
});

// 복사 버튼
$("#copyMeetAddr").addEventListener("click", async ()=>{
  try{ await navigator.clipboard.writeText(EVENT_CONFIG.meetAddress || EVENT_CONFIG.meetPlace); alert("만나는 곳 주소 복사 완료!"); }
  catch{ alert("복사 실패"); }
});
$("#copyLeaveAddr").addEventListener("click", async ()=>{
  try{ await navigator.clipboard.writeText(EVENT_CONFIG.meetAddress || EVENT_CONFIG.meetPlace); alert("헤어질 곳 주소 복사 완료!"); }
  catch{ alert("복사 실패"); }
});
$("#copyPartyAddr").addEventListener("click", async ()=>{
  try{ await navigator.clipboard.writeText(EVENT_CONFIG.partyAddress || EVENT_CONFIG.partyPlace); alert("파티/숙소 주소 복사 완료!"); }
  catch{ alert("복사 실패"); }
});

// ====== 전달 로직 ======
function buildShareText(){
  const gateName = ($("#guestName").value || "게스트").trim();
  const note  = ($("#hostNote").value || "").trim();

  const meetWhen = fmtDateKST(EVENT_CONFIG.dateStr);
  const leaveWhen = fmtDateKST(EVENT_CONFIG.endStr);
  const meet = `${EVENT_CONFIG.meetPlace} (${EVENT_CONFIG.meetAddress})`;
  const party = `${EVENT_CONFIG.partyPlace} (${EVENT_CONFIG.partyAddress})`;
  const link  = location.href;

  return [
    `📨 전달사항(${gateName})`,
    note ? `• 메모: ${note}` : null,
    `• 만남: ${meet} · ${meetWhen}`,
    `• 헤어짐: ${meet} · ${leaveWhen}`, // 동일 장소
    `• 파티장소: ${party}`,
    `• 초대장: ${link}`
  ].filter(Boolean).join("\n");
}

async function sendViaKakao(){
  const text = buildShareText();
  if (!(window.Kakao && Kakao.isInitialized && Kakao.isInitialized())) {
    alert("카카오 SDK 초기화가 필요해요. 도메인 등록 & JS키를 확인하세요.");
    return;
  }
  Kakao.Share.sendDefault({
    objectType: 'text',
    text,
    link: { mobileWebUrl: location.href, webUrl: location.href },
    buttons: [{ title: '초대장 열기', link: { mobileWebUrl: location.href, webUrl: location.href } }]
  });
}

function sendViaSMS(){
  const text = buildShareText();
  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const phone = ORGANIZER_PHONE || "";
  const body = encodeURIComponent(text);
  const smsUrl = isIOS ? `sms:${phone}&body=${body}` : `sms:${phone}?body=${body}`;
  try{ location.href = smsUrl; }catch{ alert("문자 앱을 열 수 없는 환경입니다. 모바일에서 이용해 주세요."); }
}

$("#btnKakao").addEventListener("click", sendViaKakao);
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
