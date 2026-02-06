(()=>{var e={};e.id=778,e.ids=[778],e.modules={846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},4870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},9294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},3033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},7105:(e,t,s)=>{"use strict";s.r(t),s.d(t,{patchFetch:()=>d,routeModule:()=>E,serverHooks:()=>T,workAsyncStorage:()=>c,workUnitAsyncStorage:()=>u});var n={};s.r(n),s.d(n,{POST:()=>p});var a=s(2706),r=s(8203),i=s(5994),o=s(9187);async function p(e){try{let e="https://yrlxpabmxezbcftxqivs.supabase.co",t=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!e||!t)return o.NextResponse.json({ok:!1,error:"Missing Supabase credentials. Set SUPABASE_SERVICE_ROLE_KEY environment variable."},{status:400});let s=`
-- =====================================================
-- APPOINTMENT CHANGES (Audit Log for Status Tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS appointment_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  old_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  changed_by TEXT DEFAULT 'system',

  -- For attribution: TRUE if system recovered this appointment (pending → confirmed)
  is_system_recovery BOOLEAN DEFAULT FALSE,

  -- User who owns this appointment
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointment_changes_appointment ON appointment_changes(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_changes_user ON appointment_changes(user_id);
CREATE INDEX IF NOT EXISTS idx_appointment_changes_created ON appointment_changes(created_at);
CREATE INDEX IF NOT EXISTS idx_appointment_changes_recovery ON appointment_changes(is_system_recovery);

-- RLS
ALTER TABLE appointment_changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view changes for their appointments"
  ON appointment_changes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert changes"
  ON appointment_changes FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- AUTO-LOG APPOINTMENT STATUS CHANGES (PostgreSQL Trigger)
-- =====================================================
CREATE OR REPLACE FUNCTION log_appointment_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO appointment_changes (
      appointment_id,
      old_status,
      new_status,
      user_id,
      is_system_recovery
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      NEW.user_id,
      -- Mark as recovery if: pending → confirmed
      (OLD.status = 'pending' AND NEW.status = 'confirmed')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_appointment_status_changes
  AFTER UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION log_appointment_status_change();
    `,n=await fetch(`${e}/rest/v1/query`,{method:"POST",headers:{Authorization:`Bearer ${t}`,"Content-Type":"application/json",apikey:t},body:JSON.stringify({query:s})}),a=await n.json();if(!n.ok)return console.log("⚠️ API execution failed. Trying alternative approach..."),o.NextResponse.json({ok:!1,message:"Manual execution required. Please run the SQL in Supabase SQL Editor.",sql:s,url:"https://app.supabase.com/project/yrlxpabmxezbcftxqivs/sql/new"},{status:400});return o.NextResponse.json({ok:!0,message:"✅ appointment_changes table created successfully with trigger active",result:a})}catch(e){return console.error("Error:",e),o.NextResponse.json({ok:!1,error:e instanceof Error?e.message:"Unknown error",message:"Please execute SQL manually in Supabase SQL Editor: https://app.supabase.com/project/yrlxpabmxezbcftxqivs/sql/new"},{status:500})}}let E=new a.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/init/appointment-changes/route",pathname:"/api/init/appointment-changes",filename:"route",bundlePath:"app/api/init/appointment-changes/route"},resolvedPagePath:"C:\\Users\\USER\\Proyectos Personales Software\\v3-saas-factory\\saas-factory-setup\\saas-factory\\src\\app\\api\\init\\appointment-changes\\route.ts",nextConfigOutput:"",userland:n}),{workAsyncStorage:c,workUnitAsyncStorage:u,serverHooks:T}=E;function d(){return(0,i.patchFetch)({workAsyncStorage:c,workUnitAsyncStorage:u})}},6487:()=>{},8335:()=>{}};var t=require("../../../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),n=t.X(0,[638,452],()=>s(7105));module.exports=n})();