import { createContext, useContext } from 'react';
import type { Workspace } from './data';
export type AppContext = {data:Workspace; update:(fn:(d:Workspace)=>Workspace)=>void; navigate:(path:string)=>void; toast:(text:string)=>void; openUpload:()=>void};
export const Context=createContext<AppContext|null>(null);
export function useApp(){const c=useContext(Context);if(!c)throw new Error('Workspace unavailable');return c;}
