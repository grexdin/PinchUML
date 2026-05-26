(function(){let e=new Set(`a.an.the.and.or.but.in.on.at.to.for.of.with.by.from.is.are.was.were.be.been.being.have.has.had.do.does.did.will.would.could.should.may.might.can.shall.you.your.it.its.they.them.their.this.that.these.those.not.no.nor.so.if.then.than.too.very.just.about.above.after.again.all.also.any.as.because.before.between.both`.split(`.`)),t={"sequence-diagram":{terms:[`sequence`,`message`,`login`,`auth`,`authenticate`,`call`,`request`,`response`,`return`,`session`,`token`,`jwt`,`credential`,`participant`],multiplier:6},"activity-diagram-beta":{terms:[`activity`,`workflow`,`process`,`pipeline`,`checkout`,`step`,`flow`,`decision`,`branch`,`approval`,`ci/cd`,`cd pipeline`,`deploy`,`build`,`test`,`stage`,`release`,`promote`,`production`,`docker`,`github actions`,`jenkins`,`lint`,`compile`],multiplier:8},"component-diagram":{terms:[`component`,`service`,`topology`,`microservice`,`architecture`,`module`,`dependency`,`system design`,`integration`,`gateway`,`route`,`api`,`database`,`broker`,`queue`],multiplier:6},"class-diagram":{terms:[`class`,`domain model`,`entity`,`attribute`,`method`,`inherit`,`abstract`,`relation`,`object`,`interface`,`getter`,`setter`],multiplier:6},"deployment-diagram":{terms:[`deploy`,`zone`,`server`,`node`,`infrastructure`,`host`,`cdn`,`availability`,`replica`,`cluster`,`load balancer`],multiplier:6},"state-diagram":{terms:[`state`,`lifecycle`,`transition`,`status`,`event`,`idle`,`active`],multiplier:4},"er-diagram":{terms:[`entity relationship`,`er`,`entity`],multiplier:4,penalty:.3},"gantt-diagram":{terms:[`gantt`,`timeline`,`project plan`,`schedule`,`milestone`],multiplier:4},"mindmap-diagram":{terms:[`mindmap`,`mind map`,`brainstorm`],multiplier:4},"timing-diagram":{terms:[`timing`,`time diagram`,`clock`,`signal`],multiplier:6,penalty:.2},"use-case-diagram":{terms:[`actor`,`use case`,`usecase`],multiplier:4,penalty:.3},"object-diagram":{terms:[`object diagram`,`instance`,`snapshot`],multiplier:4,penalty:.3},"archimate-diagram":{terms:[`archimate`,`enterprise architecture`],multiplier:4,penalty:.3},"files-diagram":{terms:[`file`,`directory`,`folder`,`tree`,`path`],multiplier:4,penalty:.2},"ie-diagram":{terms:[`information engineering`,`ie diagram`],multiplier:4,penalty:.2},yaml:{terms:[`yaml`,`yml`,`yaml data`],multiplier:4,penalty:.2},json:{terms:[`json`,`json data`],multiplier:4,penalty:.2},salt:{terms:[`wireframe`,`mockup`,`salt`,`ui design`],multiplier:4,penalty:.2},ditaa:{terms:[`ditaa`,`ascii art`],multiplier:4,penalty:.2},ebnf:{terms:[`ebnf`,`grammar`,`syntax rule`],multiplier:4,penalty:.2},regex:{terms:[`regex`,`regular expression`],multiplier:4,penalty:.2},creole:{terms:[`creole`,`wiki markup`],multiplier:4,penalty:.2},"ascii-math":{terms:[`math`,`latex`,`formula`,`equation`],multiplier:4,penalty:.2},nwdiag:{terms:[`network diagram`,`nwdiag`,`network topology`],multiplier:4,penalty:.3},"wbs-diagram":{terms:[`wbs`,`work breakdown`,`breakdown structure`],multiplier:4,penalty:.2},sprite:{terms:[`sprite`,`icon`,`stereotype`],multiplier:4,penalty:.2},openiconic:{terms:[`openiconic`,`icon set`],multiplier:4,penalty:.2},link:{terms:[`hyperlink`,`url`,`link`],multiplier:4,penalty:.2},"chart-diagram":{terms:[`chart`,`graph`,`plot`,`bar chart`,`pie chart`],multiplier:4,penalty:.3},"chronology-diagram":{terms:[`chronology`,`chronological`],multiplier:4,penalty:.2},"activity-diagram-legacy":{terms:[`legacy activity`,`old activity`],multiplier:1,penalty:.3}};function n(t){return t.toLowerCase().split(/[^a-z0-9_]+/).filter(t=>t.length>=2&&!e.has(t))}function r(e,t){let n=0;for(let r=0;r<e.length;r++)n+=e[r]*t[r];return n}function i(e){let t=0;for(let n=0;n<e.length;n++)t+=e[n]*e[n];return Math.sqrt(t)}function a(e,n){let r=t[e];if(!r)return 1;for(let e of r.terms)if(n.includes(e))return r.multiplier;return r.penalty??1}function o(e,t,o=5){let{vocabulary:s,idf:c,docs:l}=e,u=n(t),d=new Map;for(let e of u)d.set(e,(d.get(e)||0)+1);let f=Array(s.length).fill(0);for(let e=0;e<s.length;e++){let t=s[e];f[e]=(d.get(t)||0)/u.length*c[e]}let p=i(f);if(p===0)return{docs:l.slice(0,o),debug:[`No matching vocabulary terms`]};let m=t.toLowerCase(),h=l.map(e=>{let t=r(f,e.vector)/(p*i(e.vector)),n=a(e.id,m);return{doc:e,score:t*n,boosted:n>1}});h.sort((e,t)=>t.score-e.score);let g=new Set(h.filter(e=>e.boosted).map(e=>e.doc.id)),_=h.slice(0,o),v=new Set(_.map(e=>e.doc.id));for(let e of g)if(!v.has(e)){for(let t=_.length-1;t>=0;t--)if(!g.has(_[t].doc.id)){let n=h.find(t=>t.doc.id===e);n&&(_[t]=n,v.add(e));break}}let y=-1,b=0;for(let e=0;e<_.length;e++)if(_[e].boosted){let t=a(_[e].doc.id,m);t>b&&(b=t,y=e)}if(y>0){let[e]=_.splice(y,1);_.unshift(e)}let x=_.map(e=>`${e.doc.title} (${e.score.toFixed(3)}${e.boosted?` ★`:``})`);return{docs:_.map(e=>e.doc),debug:x}}let s=null,c=null;async function l(){return s||c||(c=fetch(`/PinchUML/embeddings-index.json`).then(e=>{if(!e.ok)throw Error(`Failed to load index: ${e.status}`);return e.json()}).then(e=>(s=e,e)),c)}function u(e,t=2e3){return e.length<=t?e:e.slice(0,t)+`

[...truncated]`}function d(e,t){return`You are a PlantUML diagram generator. Output ONLY valid PlantUML code.
No markdown fences, no explanation — just the code wrapped in @startuml ... @enduml.

## Diagram type selection

Choose the right diagram type based on the user's description. Pick the simplest,
most reliable type that fits — do not reach for obscure types unless asked by name.

- **Sequence diagram**: interactions, message flows, API calls, login/auth, request-response.
  Use \`participant\`, \`->\` for messages, \`-->\` for returns, \`activate\`/\`deactivate\`.
- **Activity diagram**: workflows, processes, pipelines, decision trees, checkout flows.
  Use \`:step;\` syntax, \`if/else/endif\` for branches, \`repeat\`/\`repeatwhile\` for loops.
  Start with \`start\` and end with \`stop\` (or \`end\`). Never use \`(*)\` — that is legacy syntax.
  Every activity diagram must have exactly ONE \`start\` and ONE \`stop\`/\`end\`.
  Never copy-paste the same logic block — use a loop or a merge/decision instead.
- **Component diagram**: system architecture, microservices, service topology.
  Use \`[Component]\` or \`component\` keyword, arrows for relationships.
- **Class diagram**: domain models, entities, object structures, inheritance.
  Use \`class\` keyword, \`+\` \`-\` \`#\` for visibility, relationships with arrows.
- **Deployment diagram**: infrastructure, servers, nodes, cloud architecture.
  Use \`node\`, \`artifact\`, \`database\`, \`cloud\`.

Default to sequence diagrams for any interaction or message flow. They are the most
reliable type. Do NOT use timing, Gantt, mindmap, or other rare diagram types unless
the user's request explicitly names them.

## Reference Documentation

Use the syntax patterns below as your authoritative reference. Copy the exact forms
shown — do not invent keywords or structures that are not in these docs.

${e.map(e=>`## ${e.title}\n\n${u(e.content)}`).join(`

---

`)}

## Rules

1. Output ONLY the PlantUML code — no markdown fences, no explanation text.
2. Always wrap in @startuml ... @enduml.
3. Copy syntax patterns exactly from the reference docs above.
4. Include a \`title\` on the first line after @startuml.
5. Keep the diagram clean and readable. Avoid overly complex structures.
6. Use skinparam or style directives from the reference when they add clarity.

## User Request

${t}

## PlantUML Code`}async function f(e,t,n){let{docs:r}=o(n,e,5),i=d(r,e),a=new AbortController,s=setTimeout(()=>a.abort(),6e4);try{let n=await fetch(t.endpoint,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${t.apiKey}`},body:JSON.stringify({model:t.model,messages:[{role:`system`,content:i},{role:`user`,content:e}],temperature:.2,max_tokens:8192}),signal:a.signal});if(!n.ok){let e=await n.text().catch(()=>``);throw n.status===401||n.status===403?Error(`Authentication failed — check your API key`):n.status===404?Error(`Endpoint not found — check the URL (did you include /v1/chat/completions?)`):n.status===429?Error(`Rate limited — wait a moment and try again`):Error(`Endpoint returned ${n.status}: ${e.slice(0,300)}`)}let r=await n.json();if(r.error)throw Error(`LLM error: ${r.error.message}`);let o=r.choices?.[0]?.message?.content;if(!o)throw Error(`LLM returned empty response`);return o=o.trim(),o.startsWith("```")&&(o=o.replace(/^```[\w]*\n?/i,``).replace(/\n?```$/i,``).trim()),o.startsWith(`@startuml`)||(o=`@startuml\n${o}`),o.endsWith(`@enduml`)||(o=`${o}\n@enduml`),o}finally{clearTimeout(s)}}self.onmessage=async e=>{let{kind:t,scenario:n,connection:r}=e.data;if(t===`generate`||t===`retry`){if(!n||!r?.endpoint||!r?.apiKey||!r?.model){self.postMessage({kind:`error`,message:`Missing scenario, endpoint, API key, or model`});return}try{let e={kind:`result`,plantuml:await f(n,r,await l())};self.postMessage(e)}catch(e){let t;t=e instanceof TypeError&&e.message.includes(`fetch`)?`Network error — check your endpoint URL and that the server allows cross-origin requests (CORS)`:e instanceof DOMException&&e.name===`AbortError`?`Request timed out after 60 seconds`:e instanceof Error?e.message:String(e);let n={kind:`error`,message:t};self.postMessage(n)}return}}})();