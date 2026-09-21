export function UsageMeter({used,limit}:{used:number;limit:number|null}){return <div className="text-sm text-gray-600">{limit===null?"Unlimited":`${used}/${limit} reports used today`}</div>;}
