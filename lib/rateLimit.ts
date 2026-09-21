import { createClient } from "@supabase/supabase-js";
export const FREE_DAILY_LIMIT=5;
const admin=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{autoRefreshToken:false,persistSession:false}});

export async function getUsage(userId:string){
 const {count}=await admin.from("usage_logs").select("*",{count:"exact",head:true}).eq("user_id",userId).gte("created_at",new Date(new Date().setUTCHours(0,0,0,0)).toISOString());
 return count||0;
}
export async function recordUsage(userId:string,inputLength:number){
 await admin.from("usage_logs").insert({user_id:userId,input_length:inputLength});
}
