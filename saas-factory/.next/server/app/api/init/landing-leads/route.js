(()=>{var e={};e.id=990,e.ids=[990],e.modules={846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},4870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},9294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},3033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},8055:(e,a,t)=>{"use strict";t.r(a),t.d(a,{patchFetch:()=>E,routeModule:()=>c,serverHooks:()=>p,workAsyncStorage:()=>u,workUnitAsyncStorage:()=>T});var s={};t.r(s),t.d(s,{GET:()=>d});var r=t(2706),n=t(8203),i=t(5994),l=t(5546),o=t(9187);async function d(){try{let e=(0,l.U)(),{error:a}=await e.rpc("exec_sql",{sql:`
        CREATE TABLE IF NOT EXISTS landing_leads (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          clinic_name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          status TEXT DEFAULT 'new',
          notes TEXT DEFAULT ''
        );

        CREATE INDEX IF NOT EXISTS idx_landing_leads_email ON landing_leads(email);
        CREATE INDEX IF NOT EXISTS idx_landing_leads_created ON landing_leads(created_at DESC);
      `}).catch(e=>({error:e})),{error:t}=await e.from("landing_leads").insert({clinic_name:"Test",email:"test@test.com",phone:"+1234567890",status:"new"}).select();if(t?.message.includes("relation")||t?.message.includes("landing_leads"))return o.NextResponse.json({success:!1,message:"La tabla landing_leads a\xfan no existe",instructions:`
            Por favor ejecuta este SQL en tu Supabase:

            CREATE TABLE IF NOT EXISTS landing_leads (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              created_at TIMESTAMPTZ DEFAULT NOW(),
              clinic_name TEXT NOT NULL,
              email TEXT NOT NULL,
              phone TEXT NOT NULL,
              status TEXT DEFAULT 'new',
              notes TEXT DEFAULT ''
            );

            CREATE INDEX IF NOT EXISTS idx_landing_leads_email ON landing_leads(email);
          `,steps:["Ve a https://app.supabase.com","Selecciona tu proyecto","SQL Editor → New Query","Pega el SQL arriba","Click RUN"]},{status:400});return t||await e.from("landing_leads").delete().eq("email","test@test.com"),o.NextResponse.json({success:!0,message:"✅ Tabla landing_leads iniciada exitosamente"})}catch(e){return o.NextResponse.json({success:!1,error:e instanceof Error?e.message:"Error desconocido",help:"Intenta crear la tabla manualmente en Supabase SQL Editor"},{status:500})}}let c=new r.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/init/landing-leads/route",pathname:"/api/init/landing-leads",filename:"route",bundlePath:"app/api/init/landing-leads/route"},resolvedPagePath:"C:\\Users\\USER\\Proyectos Personales Software\\v3-saas-factory\\saas-factory-setup\\saas-factory\\src\\app\\api\\init\\landing-leads\\route.ts",nextConfigOutput:"",userland:s}),{workAsyncStorage:u,workUnitAsyncStorage:T,serverHooks:p}=c;function E(){return(0,i.patchFetch)({workAsyncStorage:u,workUnitAsyncStorage:T})}},6487:()=>{},8335:()=>{},5546:(e,a,t)=>{"use strict";t.d(a,{U:()=>n});var s=t(8374),r=t(4512);async function n(){let e=await (0,r.UL)();return(0,s.createServerClient)("https://yrlxpabmxezbcftxqivs.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlybHhwYWJteGV6YmNmdHhxaXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NjI5NzEsImV4cCI6MjA4NTEzODk3MX0.6Rh8UKoGJfRKkxaZ8jeWzeRB0D81ViY0fKCt-A8ucLg",{cookies:{getAll:()=>e.getAll(),setAll(a){try{a.forEach(({name:a,value:t,options:s})=>e.set(a,t,s))}catch{}}}})}}};var a=require("../../../../webpack-runtime.js");a.C(e);var t=e=>a(a.s=e),s=a.X(0,[10,969,452],()=>t(8055));module.exports=s})();