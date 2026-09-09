import fs from 'node:fs'
import path from 'node:path'
const r=p=>fs.readFileSync(path.join(process.cwd(),p),'utf8')
const page=r('src/features/admin/pages/AdminVolunteerEvaluatorsPage.tsx')
const svc=r('src/features/admin/integration/persistedAdminVolunteerDirectory.ts')
const edge=r('../supabase/functions/staff-admin/index.ts')
const mig=r('../supabase/migrations/20260909190000_step_vii_e2h5_persisted_volunteer_directory.sql')
for(const x of ['listPersistedVolunteerDirectory','runtimeMode','getAdminVolunteersList','persisted-volunteer-directory-loading','Pending']) if(!page.includes(x)) throw new Error('page sentinel '+x)
for(const x of ['list_volunteer_accounts','staff-admin']) if(!svc.includes(x)) throw new Error('service sentinel '+x)
for(const x of ['list_volunteer_accounts','svc_staff_list_volunteer_accounts']) if(!edge.includes(x)) throw new Error('edge sentinel '+x)
for(const x of ['security definer','volunteer_track_eligibility','staff_invitation_tracks','human_assignments','to service_role']) if(!mig.toLowerCase().includes(x)) throw new Error('migration sentinel '+x)
for(const x of ['grant select on public.profiles to service_role','grant select on public.staff_invitations to service_role']) if(mig.toLowerCase().includes(x)) throw new Error('grant widening '+x)
console.log('Step VII-E2H5 persisted Volunteer directory: PASS')
