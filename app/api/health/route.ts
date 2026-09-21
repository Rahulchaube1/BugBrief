import { NextResponse } from "next/server";
export const runtime="nodejs";
export async function GET(){return NextResponse.json({ok:true,service:"bugbrief",timestamp:new Date().toISOString()});}
