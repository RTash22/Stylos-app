const fs = require('fs');

// Fix stateMachine.ts
let sm = fs.readFileSync('src/utils/stateMachine.ts', 'utf8');
sm = sm.replace(/STATUS_LABELS: Record<AppointmentStatus, string> = \{/, "STATUS_LABELS: Record<AppointmentStatus, string> = {\n  expirada: 'Expirada',");
sm = sm.replace(/STATUS_ICONS: Record<AppointmentStatus, string> = \{/, "STATUS_ICONS: Record<AppointmentStatus, string> = {\n  expirada: 'timer-off',");
sm = sm.replace(/STATE_TRANSITIONS: Record<AppointmentStatus, Transition\[\]> = \{/, "STATE_TRANSITIONS: Record<AppointmentStatus, Transition[]> = {\n  expirada: [],");
fs.writeFileSync('src/utils/stateMachine.ts', sm);

// Fix schedule.ts
let sc = fs.readFileSync('src/utils/schedule.ts', 'utf8');
sc = sc.replace(/workingHours\.break_start/g, 'null');
sc = sc.replace(/workingHours\.break_end/g, 'null');
sc = sc.replace(/workingHours\.start_time/g, 'workingHours.start_local_time');
sc = sc.replace(/workingHours\.end_time/g, 'workingHours.end_local_time');
fs.writeFileSync('src/utils/schedule.ts', sc);

// Fix schedule.test.ts
let st = fs.readFileSync('src/utils/__tests__/schedule.test.ts', 'utf8');
st = st.replace(/start_time:/g, 'start_local_time:');
st = st.replace(/end_time:/g, 'end_local_time:');
st = st.replace(/starts_at:/g, 'start_time:');
st = st.replace(/ends_at:/g, 'end_time:');
st = st.replace(/notes:/g, 'history_notes:');
st = st.replace(/history_notes: null,/g, 'history_notes: null, customer_notes: null,');
fs.writeFileSync('src/utils/__tests__/schedule.test.ts', st);
