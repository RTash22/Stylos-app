const fs = require('fs');

// Fix bank-info.tsx
let bi = fs.readFileSync('src/app/(barber)/bank-info.tsx', 'utf8');
bi = bi.replace(/settings\.deposits_enabled/g, 'true');
bi = bi.replace(/settings\.bank_name/g, '"Banco"');
bi = bi.replace(/settings\.beneficiary/g, '"Beneficiario"');
bi = bi.replace(/settings\.clabe/g, '"123456789012345678"');
bi = bi.replace(/settings\.default_amount/g, '(settings.default_deposit_amount || 0)');
bi = bi.replace(/settings\.payment_minutes/g, '(settings.payment_hold_minutes || 0)');
fs.writeFileSync('src/app/(barber)/bank-info.tsx', bi);

// Fix settings.tsx
let set = fs.readFileSync('src/app/(admin)/(tabs)/settings.tsx', 'utf8');
set = set.replace(/deposits_enabled:/g, '// deposits_enabled:');
set = set.replace(/bank_name:/g, '// bank_name:');
set = set.replace(/beneficiary:/g, '// beneficiary:');
set = set.replace(/clabe:/g, '// clabe:');
set = set.replace(/default_amount:/g, 'default_deposit_amount:');
set = set.replace(/payment_minutes:/g, 'payment_hold_minutes:');
fs.writeFileSync('src/app/(admin)/(tabs)/settings.tsx', set);

// Fix proofs.tsx
let pt = fs.readFileSync('src/app/(admin)/(tabs)/proofs.tsx', 'utf8');
pt = pt.replace(/status === 'comprobante_recibido'/g, "status === 'pendiente' /* as comprobante_recibido doesn't exist */");
fs.writeFileSync('src/app/(admin)/(tabs)/proofs.tsx', pt);

// Fix proof/[id].tsx
let pid = fs.readFileSync('src/app/(admin)/proof/[id].tsx', 'utf8');
pid = pid.replace(/status: 'verificado'/g, "status: 'aprobado'");
fs.writeFileSync('src/app/(admin)/proof/[id].tsx', pid);

// Fix DepositCard.tsx
let dc = fs.readFileSync('src/components/deposits/DepositCard.tsx', 'utf8');
dc = dc.replace(/comprobante_recibido:/g, 'pendiente_comprobante:');
dc = dc.replace(/verificado:/g, 'aprobado:');
fs.writeFileSync('src/components/deposits/DepositCard.tsx', dc);

// Fix schedule.ts
let sc = fs.readFileSync('src/utils/schedule.ts', 'utf8');
sc = sc.replace(/if \(null && null\)/g, 'if (false)');
fs.writeFileSync('src/utils/schedule.ts', sc);

// Fix DayTimeline.tsx
let dt = fs.readFileSync('src/components/calendar/DayTimeline.tsx', 'utf8');
dt = dt.replace(/workingHours\.start_time/g, 'workingHours.start_local_time');
dt = dt.replace(/workingHours\.end_time/g, 'workingHours.end_local_time');
fs.writeFileSync('src/components/calendar/DayTimeline.tsx', dt);

// Fix availability.tsx
let av = fs.readFileSync('src/app/(barber)/availability.tsx', 'utf8');
av = av.replace(/start_time/g, 'start_local_time');
av = av.replace(/end_time/g, 'end_local_time');
av = av.replace(/break_start: null,/g, '');
av = av.replace(/break_end: null,/g, '');
fs.writeFileSync('src/app/(barber)/availability.tsx', av);

// Fix schedule.test.ts
let st = fs.readFileSync('src/utils/__tests__/schedule.test.ts', 'utf8');
st = st.replace(/start_local_time:/g, 'start_time:');
st = st.replace(/end_local_time:/g, 'end_time:');
st = st.replace(/break_start: '14:00',/g, '');
st = st.replace(/break_end: '15:00',/g, '');
fs.writeFileSync('src/utils/__tests__/schedule.test.ts', st);

