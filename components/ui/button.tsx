import { cn } from "@/lib/utils";
export function Button({className,...props}: React.ButtonHTMLAttributes<HTMLButtonElement>){return <button className={cn("rounded-xl px-4 py-2 font-semibold",className)} {...props}/>;}
