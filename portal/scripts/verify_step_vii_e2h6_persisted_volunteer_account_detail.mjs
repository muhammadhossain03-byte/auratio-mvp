import fs from 'node:fs'
import path from 'node:path'
const r=p=>fs.readFileSync(path.join(process.cwd(),p),'utf8')
const wrapper=r('src/features/admin/pages/AdminVolunteerAccountPage.tsx')
const page=r('src/features/admin/pages/PersistedAdminVolunteerAccountPage.tsx')
const svc=r('src/features/admin/integration/persistedAdminVolunteerDirectory.ts')
const edge=r('../supabase/functions/staff-admin/index.ts')
const mig=r('../supabase/migrations/20260910021000_step_vii_e2h6_persisted_volunteer_account_detail.sql')
for(const x of ['PrototypeAdminVolunteerAccountPage','PersistedAdminVolunteerAccountPage','portalSupabaseRuntimeMode']) if(!wrapper.includes(x)) throw new Error('wrapper '+x)
for(const x of ['getPersistedVolunteerAccount','Authorized tracks','activeAssignments']) if(!page.includes(x)) throw new Error('page '+x)
for(const x of ['get_volunteer_account']) { if(!svc.includes(x)||!edge.includes(x)) throw new Error('service/edge '+x) }
for(const x of ['svc_staff_get_volunteer_account','security definer','to service_role']) if(!mig.toLowerCase().includes(x.toLowerCase())) throw new Error('migration '+x)
console.log('Step VII-E2H6 persisted Volunteer account detail: PASS')
