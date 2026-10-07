// SchoolBridge smoke test: registers a throw-away school and walks the whole
// onboarding flow against a RUNNING backend.  Usage:  npm run smoke  (API_URL=http://localhost:5000)
// Creates one test school + admin in whatever database the server points at.
const base = process.argv[2] || process.env.API_URL || "http://localhost:5000";
let token = null, pass = 0, total = 0;
const call = async (label, method, path, body, expect = true) => {
  const r = await fetch(base + path, { method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  let j = {}; try { j = await r.json(); } catch {}
  const good = r.status < 300 && j.success !== false;
  const okk = expect ? good : !good; total++; if (okk) pass++;
  console.log(`${okk ? "PASS" : "FAIL"} [${r.status}] ${label}${okk ? "" : "  -> " + (j.message || JSON.stringify(j)).slice(0, 170)}`);
  return j;
};
const d = (y, m, day) => new Date(Date.UTC(y, m - 1, day)).toISOString();
const email = process.env.SEEDED_EMAIL || `admin${Date.now()}@testschool.ng`;
const status = async (t) => { const j = await call("status " + t, "GET", "/api/onboarding/status"); const o = j.onboarding; console.log(`      -> progress=${o?.progress}% current=${o?.currentStep} completed=[${o?.completedSteps}] skipped=[${o?.skippedSteps}] canComplete=${o?.canComplete}`); return o; };

const reg = await call("register", "POST", "/api/auth/register", { schoolName: "Asslaw Private School", email, password: "Passw0rd!", phone: "08030000000" });
token = reg.token; console.log("      redirect:", reg.redirect, "| school._id:", !!reg.school?._id, "| user._id:", !!reg.user?._id);
await call("duplicate register -> 409", "POST", "/api/auth/register", { schoolName: "X School", email, password: "Passw0rd!" }, false);
const lg = await call("login", "POST", "/api/auth/login", { email, password: "Passw0rd!" }); token = lg.token;
await call("wrong password rejected", "POST", "/api/auth/login", { email, password: "nope" }, false);
await status("fresh");
await call("complete too early is refused", "POST", "/api/onboarding/complete", null, false);
await call("cannot skip required step", "POST", "/api/onboarding/skip/classes", null, false);

await call("1 school profile", "POST", "/api/onboarding/school-profile", { name: "Asslaw Private School", email, phone: "08030000000", address: "Kajola Road", city: "Kajola", state: "Ogun", schoolType: "Primary & Secondary" });
await status("after profile");
const sess = await call("2 academic session (CRUD)", "POST", "/api/school-setup/academic-sessions", { name: "2026/2027", startDate: d(2026, 9, 1), endDate: d(2027, 7, 31) });
const sessionId = sess.data?._id;
await call("current session endpoint", "GET", "/api/school-setup/academic-sessions/current");
await call("3 terms (setup)", "POST", "/api/school-setup/terms/setup", { sessionId, academicSession: sessionId, terms: [
  { name: "First Term", code: "T1", termNumber: 1, startDate: d(2026, 9, 1), endDate: d(2026, 12, 15), isCurrent: true },
  { name: "Second Term", code: "T2", termNumber: 2, startDate: d(2027, 1, 5), endDate: d(2027, 4, 1) },
  { name: "Third Term", code: "T3", termNumber: 3, startDate: d(2027, 4, 20), endDate: d(2027, 7, 31) } ] });
const cl = await call("4 class (CRUD, form payload)", "POST", "/api/school-setup/classes", { name: "JSS 1", level: "", arm: "", description: "" });
await call("4b class 2 with text level", "POST", "/api/school-setup/classes", { name: "Primary 3", level: "3" });
await call("4c duplicate class -> 409", "POST", "/api/school-setup/classes", { name: "JSS 1", level: "" }, false);
await call("5 arm (form payload: no class)", "POST", "/api/school-setup/arms", { name: "A", description: "" });
await call("6 subject (form payload)", "POST", "/api/school-setup/subjects", { name: "Mathematics", code: "", department: "", isCompulsory: true });
await call("6b subject with code", "POST", "/api/school-setup/subjects", { name: "English Language", code: "eng", department: "", isCompulsory: true });
await call("7 department", "POST", "/api/school-setup/departments", { name: "Science", code: "SCI" });
await call("8 house", "POST", "/api/school-setup/houses", { name: "Red House", color: "#dc2626" });
await status("before grading");
await call("9 grading system", "POST", "/api/onboarding/grading-system", { name: "Standard", grades: [
  { grade: "A", minScore: 70, maxScore: 100, remark: "Excellent" }, { grade: "B", minScore: 60, maxScore: 69, remark: "Very Good" }, { grade: "F", minScore: 0, maxScore: 59, remark: "Fail" } ] });
await call("list classes", "GET", "/api/school-setup/classes");
await call("delete arm", "DELETE", "/api/school-setup/arms/" + (await (await fetch(base + "/api/school-setup/arms", { headers: { Authorization: `Bearer ${token}` } })).json()).data?.[0]?._id);
await call("skip fee_structure (optional)", "POST", "/api/onboarding/skip/fee_structure");
const o = await status("all required done");
const done = await call("FINISH onboarding", "POST", "/api/onboarding/complete");
const o2 = await status("after finish");
const lg2 = await call("login after completion", "POST", "/api/auth/login", { email, password: "Passw0rd!" });
console.log("      redirect:", lg2.redirect, "| school.onboardingCompleted:", lg2.school?.onboardingCompleted);
await call("summary overview", "GET", "/api/onboarding/summary");
console.log(`\nSUMMARY: ${pass}/${total} checks passed`);
