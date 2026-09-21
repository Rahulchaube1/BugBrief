import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]){ return twMerge(clsx(inputs)); }

export function maskSecrets(input:string){
 let s=input;
 const patterns=[
  [/Bearer\s+[A-Za-z0-9._~+\/=-]+/gi,"Bearer [REDACTED]"],
  [/(api[_-]?key|secret|token|password|passwd|authorization)\s*[:=]\s*["']?[^"'\s,}]+/gi,(m:string)=>m.replace(/([:=]\s*["']?)[^"'\s,}]+$/,"$1[REDACTED]")],
  [/sk-[A-Za-z0-9_-]{20,}/g,"sk-[REDACTED]"],
  [/ghp_[A-Za-z0-9]{20,}/g,"ghp_[REDACTED]"],
  [/AKIA[0-9A-Z]{16}/g,"AKIA[REDACTED]"],
  [/\b\d{12,19}\b/g,"[POSSIBLE_SECRET_NUMBER]"]
 ] as const;
 for(const [re,repl] of patterns) s=s.replace(re as RegExp,repl as any);
 return s;
}
