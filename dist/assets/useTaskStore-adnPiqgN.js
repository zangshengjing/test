import{c,a as n,b as o}from"./index-B_EpyuKC.js";/**
 * @license lucide-react v0.441.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=c("BookOpen",[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]]);/**
 * @license lucide-react v0.441.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const i=c("CirclePlay",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polygon",{points:"10 8 16 12 10 16 10 8",key:"1cimsy"}]]);/**
 * @license lucide-react v0.441.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=c("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]]);/**
 * @license lucide-react v0.441.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=c("ExternalLink",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]),h=n(t=>({tasks:[],loading:!1,fetchTasks:async a=>{t({loading:!0});try{const s=await o.get(`/tasks?date=${a}`);t({tasks:s.tasks,loading:!1})}catch(s){console.error("[tasks] 加载失败",s),t({loading:!1})}},addTask:async a=>{const s=await o.post("/tasks",a);t(e=>({tasks:[...e.tasks,s.task].sort((r,k)=>r.sortOrder-k.sortOrder)}))},updateTask:async(a,s)=>{const e=await o.patch(`/tasks/${a}`,s);t(r=>({tasks:r.tasks.map(k=>k.id===a?e.task:k)}))},removeTask:async a=>{await o.del(`/tasks/${a}`),t(s=>({tasks:s.tasks.filter(e=>e.id!==a)}))}}));export{y as B,p as C,d as E,i as a,h as u};
