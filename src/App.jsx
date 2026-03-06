import { useState, useRef } from "react";

const T = {
  bg:"#faf7f2",surface:"#fff",warm:"#f5f0e8",border:"#e2d9cc",borderMid:"#cfc4b4",
  text:"#1c1814",mid:"#5c5248",dim:"#9c9088",
  gold:"#8B6B1A",goldL:"#faf0d8",goldB:"#c9a84c",
  blue:"#1e4d7a",blueL:"#eaf2fa",
  green:"#1e5c38",greenL:"#e8f5ee",
  red:"#7a1e1e",redL:"#faeaea",
  purple:"#4a357a",purpleL:"#f0ecfa",
  orange:"#7a4010",orangeL:"#faf0e8",
};

// ── FRAMEWORK DEFINITIONS ─────────────────────────────────────────────────────
const FORMAT_DEFS = {
  "UGC Talking Head":"Person speaks directly to camera in a real home/environment. Like a friend telling you something. No scripts visible, natural delivery, authentic setting. NOT a studio or ring light.",
  "Skit":"Acted scene or story. Can be funny, exaggerated, or sarcastic. A character performs a situation — could be a problem being dramatised, a relatable moment, or a comedic take. Story-based, not spoken to camera.",
  "Voiceover B-Roll":"No face on screen. Real-life footage of environments, products, hands — with a voice narrating over it. The visuals tell one story, the voice adds the layer.",
  "Founder Story":"The person behind the brand speaks directly. Personal, vulnerable, builds trust. Why they started it, what they discovered, what they believe.",
  "Answer Bubble":"TikTok-specific format. Someone commented on a previous video — TikTok places their comment in a bubble overlay on screen. The creator responds to that comment in a new video. Great for objections and social proof.",
  "How-To / Demo":"Shows the product being used step by step. Outcome-focused. The viewer learns something or sees a transformation happen.",
  "Review / UGC Quote":"Static image. Real customer words are the hero — large text, authentic phrasing. The image supports but the quote does the work.",
  "Us vs Them":"Static image only. Split layout — competitor on one side (crossed out, red X), your product on the other (green tick, wins highlighted). Direct comparison.",
  "Benefit Callout":"Static image. One clear product benefit called out in large bold text. Simple, direct, no clutter.",
  "Proof / Stats":"Static image leading with a number or verified claim. '97% said their mood improved.' The stat is the hook.",
  "Founder / Product":"Static image of the founder holding or next to the product. Combines human trust signal with product visibility.",
};

const FORMULA_DEFS = {
  "Emotional Trigger":"Opens with a feeling, not a fact. The first line makes the viewer feel something before they understand what's being sold. Pulls from their emotional reality.",
  "POV Hook":"'POV: You finally have the house to yourself.' Places the viewer inside a specific moment or scenario. They see themselves in it.",
  "Tribal Identity":"'If you do X, this is for you.' Creates an in-group. The viewer self-selects. They feel seen and recognised.",
  "Why Did No One Tell Me":"Positions the information as a secret or gap. Creates mild outrage or surprise that something was hidden. 'Nobody told me smell could actually change your brain chemistry.'",
  "Curiosity Loop":"Opens a question or tension that cannot be resolved without watching more. The viewer has to keep watching to get the answer.",
  "Golden Nugget":"Leads with a specific, surprising, useful fact. The fact itself is valuable enough to stop the scroll. '92% of wax melts contain synthetic fragrance that triggers headaches.'",
  "Negative Hook":"Leads with what NOT to do, or what went wrong. Counterintuitive. 'Stop buying expensive candles until you read this.'",
  "I-Led Story":"'I didn't expect this to become the thing I look forward to most.' First person, personal, specific. The viewer experiences the story through the narrator.",
  "Before / After":"Sequential or split — the state before the product and the state after. The gap between them is the hook.",
  "Founder Intro":"The founder introduces themselves and why they made this. Builds immediate trust and context. Works best when the reason is genuinely compelling.",
  "Give Me Time":"Time or effort investment framing. 'Give me 10 minutes and I'll show you...' or 'You can do this in under 5 minutes.' Lowers the perceived barrier to engagement.",
  "Investment Hook":"Leads with any kind of investment — money, time, or effort. 'I spent £200 testing every wax melt brand so you don't have to.' Positions the creator as having done the work on behalf of the viewer.",
};

const AWARENESS_DEFS = {
  "Unaware":"Doesn't know they have the problem yet. Cannot lead with the solution — must first make them feel the problem.",
  "Problem Aware":"Knows the problem exists. Actively looking for relief but doesn't know your category or product.",
  "Solution Aware":"Knows solutions like yours exist. Evaluating options. Needs to understand why yours is different.",
  "Product Aware":"Has seen or heard of your product. Has not bought. Needs to overcome a specific objection or trigger.",
  "Most Aware":"Knows your product well. Just needs a reason to act now — offer, urgency, final nudge.",
};

const AW_ANGLES = {
  "Unaware":["Consequences","Misconceptions","Identity","Use Case"],
  "Problem Aware":["Desired Outcome","Acceptance / Normalised","Failed Solutions","Consequences"],
  "Solution Aware":["Education","Objections","Features / Benefits","Failed Solutions"],
  "Product Aware":["Objections","Features / Benefits","Desired Outcome","Social Proof"],
  "Most Aware":["Desired Outcome","Objections","Identity"],
};

const PRINCIPLES=["Pain-First","Desire-First"];
const FORMATS={VIDEO:["UGC Talking Head","Skit","Voiceover B-Roll","Founder Story","Answer Bubble","How-To / Demo"],IMAGE:["Review / UGC Quote","Us vs Them","Benefit Callout","Proof / Stats","Founder / Product"]};
const AWARENESS=["Unaware","Problem Aware","Solution Aware","Product Aware","Most Aware"];
const ANGLES=["Desired Outcome","Objections","Features / Benefits","Use Case","Consequences","Misconceptions","Education","Acceptance / Normalised","Failed Solutions","Identity","Social Proof"];
const TRIGGERS=["Pain","Desire","Fear","Identity","Curiosity","Social Proof","Transformation"];
const FORMULAS=Object.keys(FORMULA_DEFS);

const EMPTY={name:"",organising_idea:"",strategic_tension:"",white_space:"",primary_principle:"",core_persona:{name:"",age:"",desc:"",desire:"",pain:"",language:{trigger:[],pain:[],desire:[],objection:[]}},secondary_persona:{name:"",age:"",desc:"",desire:"",pain:"",language:{trigger:[],pain:[],desire:[],objection:[]}},proof_points:[],brand_voice:[],concepts:[]};

const PARSE_PROMPT=`You are a creative strategist. Extract brand data from this document. Analyse all customer language and categorise each phrase into: trigger (moment they reach for the product), pain (frustration or failure), desire (outcome they want), objection (hesitation before buying). Use the customers exact words. Return ONLY raw JSON no markdown:\n{"name":"","organising_idea":"","strategic_tension":"","white_space":"","primary_principle":"Pain-First or Desire-First","core_persona":{"name":"","age":"","desc":"","desire":"","pain":"","language":{"trigger":[],"pain":[],"desire":[],"objection":[]}},"secondary_persona":{"name":"","age":"","desc":"","desire":"","pain":"","language":{"trigger":[],"pain":[],"desire":[],"objection":[]}},"proof_points":[],"brand_voice":[],"concepts":[]}`;

// ── ATOMS ─────────────────────────────────────────────────────────────────────
const Lbl=({c=T.dim,children})=><div style={{fontSize:9,fontWeight:800,letterSpacing:2.5,textTransform:"uppercase",color:c,marginBottom:5}}>{children}</div>;
const Divider=()=><div style={{height:1,background:T.border,margin:"22px 0"}}/>;
const Chip=({label,color=T.gold,bg=T.goldL,border=T.goldB})=><span style={{fontSize:10,fontWeight:700,letterSpacing:1,color,background:bg,border:`1px solid ${border}`,borderRadius:4,padding:"2px 8px",whiteSpace:"nowrap"}}>{label}</span>;

const Btn=({onClick,children,disabled,variant="primary",full,style:s={}})=>(
  <button onClick={onClick} disabled={disabled} style={{background:variant==="primary"?(disabled?T.warm:T.text):(variant==="ghost"?"transparent":T.surface),color:variant==="primary"?(disabled?T.dim:"#fff"):T.mid,border:variant==="primary"?"none":`1.5px solid ${T.border}`,borderRadius:7,padding:"10px 18px",fontSize:12,fontWeight:700,cursor:disabled?"not-allowed":"pointer",width:full?"100%":"auto",...s}}>{children}</button>
);

const FInput=({label,value,onChange,multi,placeholder,rows=3})=>(
  <div style={{marginBottom:13}}>
    {label&&<Lbl>{label}</Lbl>}
    {multi?<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:6,padding:"8px 12px",fontSize:13,color:T.text,fontFamily:"Georgia,serif",resize:"vertical",outline:"none",boxSizing:"border-box",lineHeight:1.6}}/>
    :<input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:6,padding:"8px 12px",fontSize:13,color:T.text,fontFamily:"Georgia,serif",outline:"none",boxSizing:"border-box"}}/>}
  </div>
);

const ChoiceGrid=({options,selected,onSelect,color=T.gold,colorL,colorB,multi=false})=>(
  <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>
    {options.map(opt=>{
      const label=typeof opt==="string"?opt:opt.label;
      const sub=typeof opt==="object"?opt.sub:null;
      const def=typeof opt==="object"?opt.def:null;
      const isSel=multi?(selected||[]).includes(label):selected===label;
      return(
        <button key={label} onClick={()=>onSelect(label)} title={def||""} style={{background:isSel?(colorL||T.goldL):T.surface,border:`2px solid ${isSel?(colorB||T.goldB):T.border}`,borderRadius:8,padding:"9px 14px",cursor:"pointer",textAlign:"left",flex:"1 1 130px",transition:"all 0.12s"}}>
          <div style={{fontSize:12,fontWeight:700,color:isSel?(color||T.gold):T.text}}>{label}</div>
          {sub&&<div style={{fontSize:10,color:isSel?color:T.dim,marginTop:2,lineHeight:1.4}}>{sub}</div>}
          {isSel&&<div style={{fontSize:10,color:color,marginTop:3,fontWeight:700}}>v</div>}
        </button>
      );
    })}
  </div>
);

// ── SETUP ─────────────────────────────────────────────────────────────────────
function Setup({onDone}){
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [fileName,setFileName]=useState("");
  const [payload,setPayload]=useState(null);
  const [drag,setDrag]=useState(false);

  const readFile=file=>{
    setError("");setFileName(file.name);setPayload(null);
    const ext=file.name.split(".").pop().toLowerCase();
    if(ext==="pdf"){
      const r=new FileReader();
      r.onload=e=>setPayload({type:"pdf",data:e.target.result.split(",")[1]});
      r.readAsDataURL(file);
    } else if(["txt","md"].includes(ext)){
      const r=new FileReader();
      r.onload=e=>setPayload({type:"text",text:e.target.result});
      r.readAsText(file);
    } else if(ext==="docx"){
      const r=new FileReader();
      r.onload=e=>{
        const bin=e.target.result;
        let out="",cur="";
        for(let i=0;i<bin.length;i++){const c=bin.charCodeAt(i);if(c>=32&&c<127)cur+=bin[i];else{if(cur.length>5)out+=cur+" ";cur="";}}
        const text=out.replace(/<[^>]{0,200}>/g," ").replace(/\s{3,}/g,"\n").trim();
        if(text.length>200)setPayload({type:"text",text});
        else setError("Could not extract text from DOCX. Please save as PDF.");
      };
      r.readAsBinaryString(file);
    } else if(ext==="json"){
      const r=new FileReader();
      r.onload=e=>{try{onDone(JSON.parse(e.target.result));}catch{setError("Invalid JSON file.");}};
      r.readAsText(file);
    } else{
      setError("Please upload PDF, DOCX, TXT, or a saved brand JSON.");
    }
  };

  const run=async()=>{
    if(!payload)return;
    setLoading(true);setError("");
    try{
      const content=payload.type==="pdf"
        ?[{type:"document",source:{type:"base64",media_type:"application/pdf",data:payload.data}},{type:"text",text:PARSE_PROMPT}]
        :`${PARSE_PROMPT}\n\nDOCUMENT:\n${payload.text}`;
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:3000,messages:[{role:"user",content}]})});
      const d=await res.json();
      const raw=(d.content?.[0]?.text||"").replace(/```json|```/g,"").trim();
      onDone(JSON.parse(raw));
    }catch{setError("Could not parse. Try a different format or start blank.");}
    setLoading(false);
  };

  return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{maxWidth:500,width:"100%"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:10,fontWeight:800,letterSpacing:3,color:T.dim,textTransform:"uppercase",marginBottom:8}}>Creative Room</div>
          <div style={{fontSize:14,color:T.mid,lineHeight:1.8,marginBottom:20}}>Your end-to-end creative strategy tool. Upload a brand strategy doc and the AI populates everything. Generate concepts by awareness stage, build hooks with a guided 8-step process, pick from 4 AI-generated options, then produce a complete editable creator brief ready to send.</div>
          <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginBottom:16}}>
            {["Strategy Doc","Concept Generator","Hook Builder","Creator Briefs"].map(s=>(
              <span key={s} style={{fontSize:11,fontWeight:700,color:T.gold,background:T.goldL,border:`1px solid ${T.goldB}`,borderRadius:20,padding:"4px 12px"}}>{s}</span>
            ))}
          </div>
        </div>
        <div onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)readFile(f);}} onClick={()=>document.getElementById("fi").click()}
          style={{border:`2px dashed ${drag?T.goldB:payload?T.green:T.borderMid}`,borderRadius:10,padding:"36px 24px",textAlign:"center",background:drag?T.goldL:payload?T.greenL:T.surface,cursor:"pointer",marginBottom:14,transition:"all 0.15s"}}>
          {payload?<><div style={{fontSize:26,marginBottom:6}}>v</div><div style={{fontSize:14,fontWeight:700,color:T.green}}>{fileName}</div><div style={{fontSize:12,color:T.mid,marginTop:4}}>Ready — click Populate below</div></>
          :<><div style={{fontSize:32,marginBottom:8}}>doc</div><div style={{fontSize:14,fontWeight:700,color:T.text}}>Drop your strategy doc here</div><div style={{fontSize:12,color:T.dim,marginTop:4}}>PDF / DOCX / TXT / Brand JSON</div></>}
          <input id="fi" type="file" accept=".pdf,.docx,.txt,.md,.json" onChange={e=>{if(e.target.files[0])readFile(e.target.files[0]);}} style={{display:"none"}}/>
        </div>
        {error&&<div style={{background:T.redL,border:`1px solid ${T.red}30`,borderRadius:6,padding:"10px 14px",fontSize:12,color:T.red,marginBottom:12}}>{error}</div>}
        <div style={{display:"flex",gap:10}}>
          <Btn onClick={run} disabled={!payload||loading} style={{flex:1}}>{loading?"Reading document...":"Populate from Document"}</Btn>
          <Btn onClick={()=>onDone(EMPTY)} variant="secondary">Start Blank</Btn>
        </div>
      </div>
    </div>
  );
}

// -- ADD CUSTOMER LANGUAGE COMPONENT -----------------------------------------
function AddLanguage({which,persona,updP,brand}){
  const [raw,setRaw]=useState("");
  const [loading,setLoading]=useState(false);
  const [done,setDone]=useState(false);
  const analyse=async()=>{
    if(!raw.trim())return;
    setLoading(true);setDone(false);
    const prompt2="You are a creative strategist. Categorise each insight from these raw customer phrases into: trigger (moment they reach for the product), pain (frustration or failure), desire (outcome they want), objection (hesitation before buying). Use customers exact words. Brand: "+brand.name+". Persona: "+persona.name+".\n\nRaw text:\n"+raw+"\n\nReturn ONLY raw JSON no markdown, no extra text:{\"trigger\":[],\"pain\":[],\"desire\":[],\"objection\":[]}";
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1500,messages:[{role:"user",content:prompt2}]})});
      const d=await res.json();
      const txt=(d.content?.[0]?.text||"").replace(/```json|```/g,"").trim();
      const parsed=JSON.parse(txt);
      const existing=persona.language&&!Array.isArray(persona.language)?persona.language:{trigger:[],pain:[],desire:[],objection:[]};
      const merged={
        trigger:[...new Set([...(existing.trigger||[]),...(parsed.trigger||[])])],
        pain:[...new Set([...(existing.pain||[]),...(parsed.pain||[])])],
        desire:[...new Set([...(existing.desire||[]),...(parsed.desire||[])])],
        objection:[...new Set([...(existing.objection||[]),...(parsed.objection||[])])],
      };
      updP(which,"language",merged);
      setRaw("");setDone(true);setTimeout(()=>setDone(false),3000);
    }catch(e){console.error(e);}
    setLoading(false);
  };
  return(
    <div style={{marginTop:10,background:T.goldL,border:"1.5px dashed "+T.goldB,borderRadius:7,padding:"10px 12px"}}>
      <div style={{fontSize:9,fontWeight:800,letterSpacing:1.5,color:T.gold,textTransform:"uppercase",marginBottom:6}}>Add Customer Language</div>
      <div style={{fontSize:11,color:T.mid,marginBottom:8,lineHeight:1.5}}>Paste reviews, Reddit comments, TikTok comments. AI categorises and adds to the language bank.</div>
      <textarea value={raw} onChange={e=>setRaw(e.target.value)} rows={3} placeholder="Paste raw customer language here..."
        style={{width:"100%",background:T.surface,border:"1px solid "+T.goldB,borderRadius:5,padding:"7px 10px",fontSize:12,color:T.text,fontFamily:"Georgia,serif",resize:"vertical",outline:"none",boxSizing:"border-box",lineHeight:1.6,marginBottom:8}}/>
      <button onClick={analyse} disabled={loading||!raw.trim()}
        style={{background:loading||!raw.trim()?T.border:T.text,color:"#fff",border:"none",borderRadius:6,padding:"7px 14px",fontSize:11,fontWeight:800,cursor:loading||!raw.trim()?"default":"pointer"}}>
        {loading?"Analysing...":done?"Added!":"Analyse + Add"}
      </button>
    </div>
  );
}

// ── STRATEGY DOC TAB ──────────────────────────────────────────────────────────
function DocTab({brand,set}){
  const upd=(k,v)=>set(p=>({...p,[k]:v}));
  const updP=(w,k,v)=>set(p=>({...p,[w]:{...p[w],[k]:v}}));
  const [genLoading,setGenLoading]=useState({});
  const [genConcepts,setGenConcepts]=useState({});

  const generateConcepts=async(stage)=>{
    setGenLoading(p=>({...p,[stage]:true}));
    const prompt=`Generate 3 creative ad concepts for this brand at the ${stage} awareness stage.

Brand: ${brand.name}
Organising Idea: ${brand.organising_idea}
Primary Principle: ${brand.primary_principle}
Core Persona: ${brand.core_persona?.name} — ${brand.core_persona?.desc}
Desire: ${brand.core_persona?.desire}
Pain: ${brand.core_persona?.pain}
Proof Points: ${(brand.proof_points||[]).join(", ")}
White Space: ${brand.white_space}
Awareness Stage: ${stage} — ${AWARENESS_DEFS[stage]}
Relevant Angles for this stage: ${(AW_ANGLES[stage]||[]).join(", ")}

Return ONLY raw JSON array, no markdown:
[{"name":"concept name (specific, memorable)","persuasion":"Feeling First or Understanding First or Proof First","persona":"${brand.core_persona?.name||"Core Persona"}","awareness":"${stage}","angle":"which angle from the list","trigger":"psychology trigger","aha":"the single sentence where the viewer shifts from interested to convinced","example":"one sentence describing what this ad would actually look like — what you see and hear in the first 5 seconds"}]`;
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:2000,messages:[{role:"user",content:prompt}]})});
      const d=await res.json();
      const raw=(d.content?.[0]?.text||"").replace(/```json|```/g,"").trim();
      setGenConcepts(p=>({...p,[stage]:JSON.parse(raw)}));
    }catch{setGenConcepts(p=>({...p,[stage]:[{name:"Error",persuasion:"",persona:"",awareness:stage,angle:"",trigger:"",aha:"Could not generate. Try again.",example:""}]}));}
    setGenLoading(p=>({...p,[stage]:false}));
  };

  const saveConcept=c=>set(p=>({...p,concepts:[...(p.concepts||[]),c]}));
  const removeConcept=i=>set(p=>({...p,concepts:p.concepts.filter((_,idx)=>idx!==i)}));

  const PersonaBlock=({which,color,bg})=>{
    const p=brand[which]||{};
    return(
      <div style={{background:bg,border:`1px solid ${color}25`,borderRadius:8,padding:"14px 18px",marginBottom:16}}>
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          <div style={{flex:2,minWidth:130}}><FInput label="Name" value={p.name||""} onChange={v=>updP(which,"name",v)} placeholder="e.g. Sara"/></div>
          <div style={{flex:1,minWidth:80}}><FInput label="Age" value={p.age||""} onChange={v=>updP(which,"age",v)} placeholder="28"/></div>
        </div>
        <FInput label="Description" value={p.desc||""} onChange={v=>updP(which,"desc",v)} multi placeholder="Who is this person, their daily reality..."/>
        <FInput label="Primary Desire" value={p.desire||""} onChange={v=>updP(which,"desire",v)} placeholder="What do they want most?"/>
        <FInput label="Primary Pain" value={p.pain||""} onChange={v=>updP(which,"pain",v)} placeholder="What problem are they experiencing?"/>
        <Lbl>Language Bank (auto-categorised by AI)</Lbl>
        {(()=>{
          const lang=p.language||{};
          const isFlat=Array.isArray(lang);
          const catColors={"trigger":T.orange,"pain":T.red,"desire":T.green,"objection":T.purple};
          const catLabels={"trigger":"Trigger","pain":"Pain","desire":"Desire","objection":"Objection"};
          if(isFlat){
            return [...lang,""].map((ph,i)=>(
              <input key={i} value={ph}
                onChange={e=>{const arr=[...lang];if(i===arr.length)arr.push(e.target.value);else arr[i]=e.target.value;updP(which,"language",arr.filter(x=>x));}}
                placeholder="Exact customer phrase..."
                style={{width:"100%",background:T.surface,border:"1px solid "+T.border,borderRadius:5,padding:"6px 10px",fontSize:12,fontStyle:"italic",color:T.mid,outline:"none",fontFamily:"Georgia,serif",marginBottom:6,boxSizing:"border-box"}}/>
            ));
          }
          return Object.entries(lang).map(([cat,phrases])=>phrases.length>0&&(
            <div key={cat} style={{marginBottom:6}}>
              <div style={{fontSize:9,fontWeight:800,letterSpacing:1.5,color:catColors[cat],textTransform:"uppercase",marginBottom:3}}>{catLabels[cat]}</div>
              {phrases.map((ph,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:catColors[cat],flexShrink:0}}/>
                  <div style={{fontSize:12,color:T.mid,fontStyle:"italic",lineHeight:1.4}}>{ph}</div>
                </div>
              ))}
            </div>
          ));
        })()}
        <AddLanguage which={which} persona={p} updP={updP} brand={brand}/>
      </div>
    );
  };

  const PERSUASION_COLORS={"Feeling First":{c:T.gold,bg:T.goldL,b:T.goldB},"Understanding First":{c:T.blue,bg:T.blueL,b:T.blue},"Proof First":{c:T.purple,bg:T.purpleL,b:T.purple}};

  return(
    <div style={{maxWidth:700,margin:"0 auto"}}>
      <div style={{fontSize:15,fontWeight:800,color:T.text,marginBottom:14,paddingBottom:8,borderBottom:`2px solid ${T.border}`}}>1 — Strategic Foundation</div>
      <FInput label="Brand Name" value={brand.name||""} onChange={v=>upd("name",v)} placeholder="Brand name..."/>
      <FInput label="Organising Idea" value={brand.organising_idea||""} onChange={v=>upd("organising_idea",v)} multi placeholder="The single central thought that ties everything together..."/>
      <FInput label="Strategic Tension" value={brand.strategic_tension||""} onChange={v=>upd("strategic_tension",v)} multi placeholder="The core contradiction strategy must resolve..."/>
      <FInput label="White Space" value={brand.white_space||""} onChange={v=>upd("white_space",v)} multi placeholder="What nobody in the category is currently owning..."/>
      <div style={{marginBottom:16}}>
        <Lbl>Primary Organising Principle</Lbl>
        <ChoiceGrid options={[{label:"Pain-First",sub:"Lead with the problem. People searching for relief."},{label:"Desire-First",sub:"Lead with the vision. People drawn to an identity."}]} selected={brand.primary_principle} onSelect={v=>upd("primary_principle",v)}/>
        {brand.primary_principle&&<div style={{fontSize:12,color:T.mid,background:T.warm,borderRadius:6,padding:"8px 12px",marginTop:-6,lineHeight:1.6}}>
          {brand.primary_principle==="Pain-First"?"Your creative leads with the problem first — make them feel the pain before you offer the solution. Angles like Failed Solutions, Consequences, and Objections work well here.":"Your creative leads with who they want to become — the identity, ritual, or desire. Make them see themselves in the ad before the product appears. Angles like Identity, Desired Outcome, and Acceptance work well here."}
        </div>}
      </div>
      <Divider/>

      <div style={{fontSize:15,fontWeight:800,color:T.text,marginBottom:14,paddingBottom:8,borderBottom:`2px solid ${T.border}`}}>2 — Core Persona <span style={{fontSize:11,fontWeight:500,color:T.dim}}>Phase 1</span></div>
      <PersonaBlock which="core_persona" color={T.green} bg={T.greenL}/>

      <div style={{fontSize:15,fontWeight:800,color:T.text,marginBottom:14,paddingBottom:8,borderBottom:`2px solid ${T.border}`}}>3 — Secondary Persona <span style={{fontSize:11,fontWeight:500,color:T.dim}}>Phase 2</span></div>
      <PersonaBlock which="secondary_persona" color={T.blue} bg={T.blueL}/>
      <Divider/>

      <div style={{fontSize:15,fontWeight:800,color:T.text,marginBottom:14,paddingBottom:8,borderBottom:`2px solid ${T.border}`}}>4 — Proof Points</div>
      {[...(brand.proof_points||[]),""].map((pt,i)=>(
        <input key={i} value={pt} onChange={e=>{const arr=[...(brand.proof_points||[])];if(i===arr.length)arr.push(e.target.value);else arr[i]=e.target.value;upd("proof_points",arr.filter(x=>x));}} placeholder={`Proof point ${i+1}...`}
          style={{width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:5,padding:"7px 11px",fontSize:12,color:T.text,outline:"none",fontFamily:"Georgia,serif",marginBottom:7,boxSizing:"border-box"}}/>
      ))}
      <Divider/>

      <div style={{fontSize:15,fontWeight:800,color:T.text,marginBottom:6,paddingBottom:8,borderBottom:`2px solid ${T.border}`}}>5 — Concepts by Awareness Stage</div>
      <div style={{fontSize:12,color:T.mid,marginBottom:16,lineHeight:1.6}}>Generate concept ideas per awareness stage. Save the ones you want to develop, then run them through Hook Builder.</div>

      {AWARENESS.map(stage=>{
        const cols={Unaware:{c:T.red,bg:T.redL,b:T.red},"Problem Aware":{c:T.orange,bg:T.orangeL,b:T.orange},"Solution Aware":{c:T.gold,bg:T.goldL,b:T.goldB},"Product Aware":{c:T.blue,bg:T.blueL,b:T.blue},"Most Aware":{c:T.green,bg:T.greenL,b:T.green}}[stage]||{c:T.dim,bg:T.warm,b:T.border};
        const concepts=genConcepts[stage]||[];
        return(
          <div key={stage} style={{background:T.surface,border:`1.5px solid ${T.border}`,borderLeft:`4px solid ${cols.c}`,borderRadius:8,marginBottom:12,overflow:"hidden"}}>
            <div style={{padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
              <div>
                <div style={{fontSize:13,fontWeight:800,color:cols.c}}>{stage}</div>
                <div style={{fontSize:11,color:T.dim,marginTop:2}}>{AWARENESS_DEFS[stage]}</div>
              </div>
              <Btn onClick={()=>generateConcepts(stage)} disabled={genLoading[stage]} variant="secondary" style={{fontSize:11}}>
                {genLoading[stage]?"Generating...":"Generate Concepts"}
              </Btn>
            </div>
            {concepts.length>0&&(
              <div style={{borderTop:`1px solid ${T.border}`,padding:"12px 16px"}}>
                {concepts.map((c,i)=>{
                  const pc=PERSUASION_COLORS[c.persuasion]||{c:T.dim,bg:T.warm,b:T.border};
                  const alreadySaved=(brand.concepts||[]).some(x=>x.name===c.name);
                  return(
                    <div key={i} style={{background:cols.bg,border:`1px solid ${cols.b}30`,borderRadius:7,padding:"12px 14px",marginBottom:8}}>
                      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:8,flexWrap:"wrap"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                          <div style={{fontSize:13,fontWeight:800,color:cols.c}}>{c.name}</div>
                          <Chip label={c.persuasion} color={pc.c} bg={pc.bg} border={pc.b}/>
                          <Chip label={c.angle} color={T.mid} bg={T.warm} border={T.border}/>
                        </div>
                        {!alreadySaved&&<Btn onClick={()=>saveConcept(c)} variant="secondary" style={{fontSize:11,padding:"5px 12px"}}>Save -></Btn>}
                        {alreadySaved&&<span style={{fontSize:11,color:T.green,fontWeight:700}}>v Saved</span>}
                      </div>
                      <div style={{fontSize:12,color:T.mid,marginBottom:6,lineHeight:1.5}}><b style={{color:cols.c}}>Aha: </b>{c.aha}</div>
                      <div style={{fontSize:11,color:T.mid,fontStyle:"italic",lineHeight:1.5,borderLeft:`2px solid ${cols.b}`,paddingLeft:8}}>{c.example}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {(brand.concepts||[]).length>0&&(
        <>
          <Divider/>
          <div style={{fontSize:14,fontWeight:800,color:T.text,marginBottom:12}}>Saved Concepts</div>
          {brand.concepts.map((c,i)=>{
            const pc=PERSUASION_COLORS[c.persuasion]||{c:T.dim,bg:T.warm,b:T.border};
            return(
              <div key={i} style={{background:T.warm,border:`1.5px solid ${T.border}`,borderRadius:7,padding:"12px 16px",marginBottom:8,display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                    <div style={{fontSize:13,fontWeight:800,color:T.text}}>{c.name}</div>
                    <Chip label={c.persuasion} color={pc.c} bg={pc.bg} border={pc.b}/>
                    <Chip label={c.awareness} color={T.mid} bg={T.surface} border={T.border}/>
                  </div>
                  <div style={{fontSize:12,color:T.mid,lineHeight:1.5}}>{c.aha}</div>
                </div>
                <button onClick={()=>removeConcept(i)} style={{fontSize:11,color:T.red,background:"none",border:"none",cursor:"pointer",flexShrink:0}}>x</button>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

function EField({label,val,onChange,color,multi,rows=2}){
  return(
    <div style={{marginBottom:10}}>
      <div style={{fontSize:9,fontWeight:800,letterSpacing:1.5,color:color||T.dim,textTransform:"uppercase",marginBottom:4}}>{label}</div>
      {multi
        ?<textarea value={val||""} onChange={e=>onChange(e.target.value)} rows={rows}
            style={{width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:5,padding:"7px 10px",fontSize:12,color:T.text,fontFamily:"Georgia,serif",resize:"vertical",outline:"none",boxSizing:"border-box",lineHeight:1.6}}/>
        :<input value={val||""} onChange={e=>onChange(e.target.value)}
            style={{width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:5,padding:"7px 10px",fontSize:12,color:T.text,fontFamily:"Georgia,serif",outline:"none",boxSizing:"border-box"}}/>
      }
    </div>
  
  );
}

function EList({label,items,onChange,color}){
  return(
    <div style={{marginBottom:10}}>
      <div style={{fontSize:9,fontWeight:800,letterSpacing:1.5,color:color||T.dim,textTransform:"uppercase",marginBottom:4}}>{label}</div>
      {(items||[]).map((item,i)=>(
        <input key={i} value={item} onChange={e=>onChange(i,e.target.value)}
          style={{width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:5,padding:"6px 10px",fontSize:12,color:T.text,fontFamily:"Georgia,serif",outline:"none",boxSizing:"border-box",marginBottom:3}}/>
      ))}
    </div>
  
  );
}

// ── HOOK BUILDER TAB ──────────────────────────────────────────────────────────
function HookTab({brand,savedHooks,setSavedHooks,activeConcept,clearActiveConcept}){
  const STEPS_KEYS=["principle","persona","format","subtype","awareness","angle","trigger","formula"];

  const conceptToSel=c=>c?{
    principle:brand.primary_principle||"Desire-First",
    persona:c.persona||brand.core_persona?.name||"",
    awareness:c.awareness||"",
    angle:c.angle||"",
    trigger:c.trigger||"",
  }:{};

  const [step,setStep]=useState(activeConcept?2:0);
  const [sel,setSel]=useState(activeConcept?conceptToSel(activeConcept):{});
  const [stage,setStage]=useState("deciding");
  const [hooks,setHooks]=useState([]);
  const [allPrevHooks,setAllPrevHooks]=useState([]);
  const [chosen,setChosen]=useState(null);
  const [editedHook,setEditedHook]=useState("");
  const [brief,setBrief]=useState(null);
  const [loading,setLoading]=useState(false);
  const [copied,setCopied]=useState(false);

  const nextStep=(fromIdx,newSel)=>{
    let next=fromIdx+1;
    while(next<8&&newSel[STEPS_KEYS[next]]&&STEPS_KEYS[next]!=="formula")next++;
    return next;
  };
  const pick=(key,val)=>{
    const ns={...sel,[key]:val};
    setSel(ns);
    setStep(nextStep(STEPS_KEYS.indexOf(key),ns));
  };
  const reset=()=>{
    setSel({});setHooks([]);setAllPrevHooks([]);setChosen(null);
    setEditedHook("");setBrief(null);setStage("deciding");
    setStep(0);setCopied(false);
    if(clearActiveConcept)clearActiveConcept();
  };

  const personas=[
    brand.core_persona?.name&&{label:brand.core_persona.name,sub:"Core - Phase 1"},
    brand.secondary_persona?.name&&{label:brand.secondary_persona.name,sub:"Secondary - Phase 2"},
  ].filter(Boolean);
  const angles=sel.awareness?(AW_ANGLES[sel.awareness]||ANGLES):ANGLES;

  const STEPS=[
    {key:"principle",title:"Primary Organising Principle",sub:"How does this product get discovered?",opts:PRINCIPLES.map(p=>({label:p,sub:p==="Pain-First"?"Lead with the problem":"Lead with the vision"})),color:T.gold,bg:T.goldL,border:T.goldB},
    {key:"persona",title:"Persona",sub:"Who are we talking to?",opts:personas.length?personas:[{label:"Add personas in Strategy Doc tab",sub:""}],color:T.green,bg:T.greenL,border:T.green},
    {key:"format",title:"Format Category",sub:"Video or Image?",opts:[{label:"VIDEO",sub:"Moving image"},{label:"IMAGE",sub:"Static"}],color:T.blue,bg:T.blueL,border:T.blue},
    {key:"subtype",title:"Format Subtype",sub:"What specific style?",opts:(FORMATS[sel.format]||[]).map(s=>({label:s,def:FORMAT_DEFS[s]||""})),color:T.blue,bg:T.blueL,border:T.blue},
    {key:"awareness",title:"Awareness Stage",sub:"Where is this person in their journey?",opts:AWARENESS.map(a=>({label:a,sub:AWARENESS_DEFS[a]})),color:T.green,bg:T.greenL,border:T.green},
    {key:"angle",title:"Messaging Angle",sub:"What perspective does this ad take?",opts:angles.map(a=>({label:a})),color:T.orange,bg:T.orangeL,border:T.orange},
    {key:"trigger",title:"Psychology Trigger",sub:"What emotion activates this ad?",opts:TRIGGERS.map(t=>({label:t})),color:T.red,bg:T.redL,border:T.red},
    {key:"formula",title:"Hook Formula",sub:"What structure delivers the opening? Hover for definition.",opts:FORMULAS.map(f=>({label:f,def:FORMULA_DEFS[f]})),color:T.purple,bg:T.purpleL,border:T.purple},
  ];

  const cur=STEPS[step];
  const done=step>=STEPS.length;
  const persona=sel.persona===brand.core_persona?.name?brand.core_persona:brand.secondary_persona;

  const lang=persona?.language||{};
  const langFlat=Array.isArray(lang);
  const trigPhrases=langFlat?lang:(lang.trigger||[]);
  const painPhrases=langFlat?lang:(lang.pain||[]);
  const desirePhrases=langFlat?lang:(lang.desire||[]);
  const objPhrases=langFlat?lang:(lang.objection||[]);

  const ANGLE_DEFS={
    "Consequences":"What gets worse in their life if they never solve this? Lead with the cost of inaction.",
    "Failed Solutions":"They have already tried things that disappointed them. Open by naming what did not work.",
    "Desired Outcome":"Paint the specific after-state they fantasise about. Make them feel the transformation.",
    "Objections":"Name the exact doubt stopping them from buying and dismantle it directly.",
    "Features/Benefits":"Frame as outcomes this persona cares about, not technical features.",
    "Use Case":"Show the specific daily moment where they experience this problem. Make it recognisable.",
    "Misconceptions":"Correct the false belief they hold about the problem or category.",
    "Education":"Lead with the surprising fact they do not know that would change how they see this.",
    "Acceptance":"Challenge what they have normalised or given up on that they should not have.",
    "Identity":"Show who they want to become. How does using this product reflect on who they are.",
  };
  const AWARENESS_RULES={
    "Unaware":"Lead with a situation or feeling they already recognise from daily life. Do NOT mention the product, the category, or any solution.",
    "Problem Aware":"Lead with the feeling or frustration. Make them feel understood before anything else. Introduce the product only after emotional connection is made.",
    "Solution Aware":"They have tried things and been disappointed. Lead with differentiation. Why this is different from everything they already tried.",
    "Product Aware":"They know the brand but have not bought. Handle their specific objection directly.",
    "Most Aware":"Lead with the offer or final reason to act now. No need to explain the problem.",
  };
  const FORMULA_STRUCTURES={
    "Tribal Identity":"IF YOU [specific behaviour this persona already does] THIS IS FOR YOU. Instant recognition before the product appears.",
    "Investment Hook":"I SPENT [specific amount] ON [thing] SO YOU DO NOT HAVE TO. Creator did the work on behalf of viewer.",
    "Why Did No One Tell Me":"WHY DID NO ONE TELL ME [surprising fact or solution]? Genuine surprise. Secret being revealed.",
    "Problem-First":"I TRIED [everything] TO SOLVE [problem]. NOTHING WORKED UNTIL [product]. Problem felt before solution appears.",
    "POV Hook":"POV: [specific relatable moment the persona already lives]. They see themselves before they see the product.",
    "Emotional Trigger":"Open directly with pure feeling. No preamble. First line makes them feel something before they understand what is being sold.",
    "Give Me Time":"GIVE ME [short time] AND I WILL SHOW YOU [specific transformation]. Small ask lowers barrier.",
    "Founder Intro":"I STARTED [brand] BECAUSE [specific personal frustration]. Personal and specific. Vulnerability builds trust.",
    "Golden Nugget":"Lead with the single most surprising specific fact or real customer quote verbatim. The fact stops the scroll.",
    "Negative Hook":"STOP [doing X] or I TRIED [X] AND [what went wrong]. Counterintuitive framing creates curiosity.",
    "Curiosity Loop":"Open a question or tension that cannot be resolved without watching more. Never resolve in the hook.",
    "I-Led Story":"I [specific personal thing that happened]. First person. Viewer lives the story before product appears.",
    "Before / After":"Show the painful before-state first. The gap between before and after is the hook.",
    "Creator Partnership":"I TRIED EVERY [product type] ON THE MARKET. THIS IS THE ONLY ONE I KEPT BUYING. Trust by exhaustive research.",
  };
  const principleRule=sel.principle==="Pain-First"
    ?"PAIN-FIRST: Lead with the problem, frustration, or failure. Do not open with anything positive or aspirational. Product appears only after pain has been felt."
    :"DESIRE-FIRST: Lead with the identity, vision, or aspiration this persona wants. Product is the vehicle. Do not open with a problem.";
  const langSection=langFlat
    ?("LANGUAGE BANK - use at least one exact phrase verbatim, build the hook around it:\n"+(lang.length>0?lang.map(x=>"- "+x).join("\n"):"none provided"))
    :("LANGUAGE BANK - MANDATORY. Use at least one exact phrase verbatim. Do not paraphrase.\n\nTRIGGER PHRASES (use to open the hook):\n"+(trigPhrases.length>0?trigPhrases.map(x=>"- "+x).join("\n"):"none")+"\n\nPAIN PHRASES (use when Pain-First or Problem Aware):\n"+(painPhrases.length>0?painPhrases.map(x=>"- "+x).join("\n"):"none")+"\n\nDESIRE PHRASES (use when Desire-First or Solution Aware):\n"+(desirePhrases.length>0?desirePhrases.map(x=>"- "+x).join("\n"):"none")+"\n\nOBJECTION PHRASES (use in brief body not hook):\n"+(objPhrases.length>0?objPhrases.map(x=>"- "+x).join("\n"):"none"));
  const baseCtx="BRAND: "+brand.name+"\nOrganising Idea: "+brand.organising_idea+"\nStrategic Tension: "+(brand.strategic_tension||"")+"\nWhite Space: "+(brand.white_space||"")+"\nBrand Voice: "+(brand.brand_voice||[]).join(" | ")+"\n\nPERSONA: "+sel.persona+"\nDescription: "+(persona?.desc||"")+"\nDesire: "+(persona?.desire||"")+"\nPain: "+(persona?.pain||"")+"\n\nFORMAT: "+sel.format+" - "+sel.subtype+" ("+( FORMAT_DEFS[sel.subtype]||"")+")\n\nPRINCIPLE: "+principleRule+"\n\nAWARENESS: "+sel.awareness+"\nRule: "+(AWARENESS_RULES[sel.awareness]||"")+"\n\nANGLE: "+sel.angle+"\nMeaning: "+(ANGLE_DEFS[sel.angle]||sel.angle)+"\n\nTRIGGER: "+sel.trigger+"\n\nFORMULA: "+sel.formula+"\nStructure: "+(FORMULA_STRUCTURES[sel.formula]||FORMULA_DEFS[sel.formula]||"")+"\n\n"+langSection+"\n\nPROOF POINTS:\n"+(brand.proof_points||[]).join("\n");


  const generateHooks=async()=>{
    const prev=[...allPrevHooks,...hooks.map(h=>h.hook_text)].filter(Boolean);
    setLoading(true);setHooks([]);setChosen(null);setEditedHook("");setStage("hooks");
    const avoidBlock=prev.length>0
      ?`\n\nPREVIOUS HOOKS - do NOT repeat or closely resemble any of these, go in completely different directions:\n${prev.map((h,i)=>`${i+1}. "${h}"`).join("\n")}`
      :"";
    const prompt="You are a senior direct response creative strategist. Generate hooks that feel like real customers talking to a friend — not a brand writing ads.\n\n"+baseCtx+avoidBlock+"\n\nTASK: Generate exactly 4 hooks. Each MUST:\n1. Follow the "+sel.formula+" formula structure exactly as defined\n2. Use at least one phrase from the language bank VERBATIM - word for word, not paraphrased\n3. Respect the "+sel.awareness+" rule - especially what must NOT appear\n4. Activate the "+sel.trigger+" emotion as the entry point\n5. Sound like a real person talking to a friend, never a brand\n6. Feel distinctly different from each other\n7. Not repeat any previous hooks listed above\n\nFor hook_visual: specific shot, person, environment - not vague but specific.\nFor hook_audio: exact tone of voice, pacing, ambient sound. N/A for static image.\n\nReturn ONLY a raw JSON array no markdown:\n[{\"hook_text\":\"exact opening line\",\"hook_visual\":\"specific visual\",\"hook_audio\":\"specific audio or N/A\"},{\"hook_text\":\"...\",\"hook_visual\":\"...\",\"hook_audio\":\"...\"},{\"hook_text\":\"...\",\"hook_visual\":\"...\",\"hook_audio\":\"...\"},{\"hook_text\":\"...\",\"hook_visual\":\"...\",\"hook_audio\":\"...\"}]";
;
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1500,messages:[{role:"user",content:prompt}]})});
      const d=await res.json();
      const raw=(d.content?.[0]?.text||"").replace(/```json|```/g,"").trim();
      const parsed=JSON.parse(raw);
      setHooks(parsed);
      setAllPrevHooks(p=>[...p,...parsed.map(h=>h.hook_text)]);
    }catch{setHooks([{hook_text:"Could not generate hooks. Please try again.",hook_visual:"",hook_audio:""}]);}
    setLoading(false);
  };

  const generateBrief=async()=>{
    const hookToUse=editedHook||hooks[chosen]?.hook_text||"";
    setLoading(true);setBrief(null);setStage("brief");
    const prompt="You are a senior direct response creative strategist writing a creator brief. Be specific - vague briefs produce expensive mediocre creative.\n\n"+baseCtx+"\n\nCHOSEN HOOK: \""+hookToUse+"\"\n\nWrite a complete creator brief. Rules per field:\n- aha: single sentence where viewer shifts from curious to convinced\n- gut (0-3s): emotional stop-scroll moment, no product yet, pure feeling\n- brain_a (3-8s): introduce product with one specific believable proof point\n- brain_b (8-15s): handle "+sel.persona+" top 3 objections using their exact language\n- pocket: one CTA matching the "+sel.awareness+" stage, not a hard sell if awareness is low\n- overview: 2-3 sentences, who this is for and what feeling it must create\n- dos: specific - not 'be authentic' but 'film in natural daylight no ring light visible'\n- donts: specific things that will kill this ad for this persona and format\n- broll: exact shots, not 'lifestyle footage' but 'close up of hands placing product label visible'\n- casting: exact age range, energy, what they look like, what they must NOT look like\n- variations: 3 ways to change one specific thing and retest from same filming session\n- filming: orientation, lighting, location, audio\n\nReturn ONLY raw JSON no markdown:\n{\"aha\":\"\",\"gut\":\"\",\"brain_a\":\"\",\"brain_b\":\"\",\"pocket\":\"\",\"overview\":\"\",\"dos\":[\"\",\"\",\"\"],\"donts\":[\"\",\"\",\"\"],\"broll\":[\"\",\"\",\"\",\"\"],\"casting\":\"\",\"variations\":[\"\",\"\",\"\"],\"filming\":\"\"}";
;
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:2000,messages:[{role:"user",content:prompt}]})});
      const d=await res.json();
      const raw=(d.content?.[0]?.text||"").replace(/```json|```/g,"").trim();
      setBrief({
        ...JSON.parse(raw),
        hook_text:hookToUse,
        hook_visual:hooks[chosen]?.hook_visual||"",
        hook_audio:hooks[chosen]?.hook_audio||"",
      });
    }catch{setBrief({error:true});}
    setLoading(false);
  };

  const saveBrief=()=>{
    if(!brief)return;
    const h={...brief,selections:sel,brand:brand.name,date:new Date().toLocaleDateString()};
    setSavedHooks(p=>[...p,h]);
  };

  const downloadBrief=(h)=>{
    const lines=[
      `HOOK: ${h.hook_text}`,
      `VISUAL: ${h.hook_visual||""}`,
      `AUDIO: ${h.hook_audio||""}`,
      ``,`AHA MOMENT: ${h.aha||""}`,
      ``,`GBP BODY:`,
      `GUT: ${h.gut||""}`,
      `BRAIN A: ${h.brain_a||""}`,
      `BRAIN B: ${h.brain_b||""}`,
      `POCKET: ${h.pocket||""}`,
      ``,`CREATOR BRIEF:`,`${h.overview||""}`,
      ``,`DOS:`,...(h.dos||[]),
      ``,`DONTS:`,...(h.donts||[]),
      ``,`B-ROLL:`,...(h.broll||[]),
      ``,`CASTING: ${h.casting||""}`,
      ``,`VARIATIONS:`,...(h.variations||[]),
      ``,`FILMING: ${h.filming||""}`,
      ``,`Format: ${h.selections?.format||""} ${h.selections?.subtype||""} | Awareness: ${h.selections?.awareness||""} | Angle: ${h.selections?.angle||""} | ${h.date||""}`,
    ];
    const text2=lines.join("\n");
    const encoded="data:text/plain;charset=utf-8,"+encodeURIComponent(text2);
    const a=document.createElement("a");
    a.href=encoded;
    a.download="brief-"+(h.hook_text||"hook").slice(0,30).replace(/[^a-zA-Z0-9]/g,"-")+".txt";
    a.click();
  };

  const copyBrief=()=>{
    if(!brief)return;
    const h=brief;
    const text=[
      `HOOK: ${h.hook_text}`,`VISUAL: ${h.hook_visual||""}`,`AUDIO: ${h.hook_audio||""}`,
      ``,`AHA: ${h.aha||""}`,
      ``,`GUT: ${h.gut||""}`,`BRAIN A: ${h.brain_a||""}`,`BRAIN B: ${h.brain_b||""}`,`POCKET: ${h.pocket||""}`,
      ``,`BRIEF: ${h.overview||""}`,
      ``,`DOS:`,...(h.dos||[]),``,`DONTS:`,...(h.donts||[]),
      ``,`B-ROLL:`,...(h.broll||[]),``,`CASTING: ${h.casting||""}`,
      ``,`VARIATIONS:`,...(h.variations||[]),``,`FILMING: ${h.filming||""}`,
    ].join("\n");
    navigator.clipboard.writeText(text).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});
  };

  const alreadySaved=brief&&savedHooks.some(h=>h.hook_text===brief.hook_text);


  return(
    <div style={{maxWidth:700,margin:"0 auto"}}>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:18,fontWeight:800,color:T.text,marginBottom:4}}>Hook Builder</div>
        <div style={{fontSize:13,color:T.mid}}>Make your decisions, get 4 hook options, pick one, generate the full brief. All fields editable before saving.</div>
      </div>

      {Object.keys(sel).length>0&&(
        <div style={{background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:8,padding:"10px 14px",marginBottom:16}}>
          <Lbl>Your Path</Lbl>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,alignItems:"center"}}>
            {STEPS.filter(s=>sel[s.key]).map((s,i)=>(
              <span key={s.key} style={{display:"flex",alignItems:"center",gap:4}}>
                <Chip label={sel[s.key]} color={s.color} bg={s.bg} border={s.border}/>
                {i<Object.keys(sel).length-1&&<span style={{color:T.border,fontSize:12}}>-></span>}
              </span>
            ))}
          </div>
          <button onClick={reset} style={{marginTop:8,fontSize:11,color:T.dim,background:"none",border:"none",cursor:"pointer",padding:0,textDecoration:"underline"}}>Start over</button>
        </div>
      )}

      {stage==="deciding"&&!done&&cur&&(
        <div style={{background:T.surface,border:`2px solid ${cur.border}30`,borderTop:`4px solid ${cur.color}`,borderRadius:10,padding:"18px 22px",marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            <div style={{width:20,height:20,borderRadius:"50%",background:cur.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#fff",flexShrink:0}}>{step+1}</div>
            <div style={{fontSize:15,fontWeight:800,color:T.text}}>{cur.title}</div>
          </div>
          <div style={{fontSize:12,color:T.mid,marginBottom:14,paddingLeft:28}}>{cur.sub}</div>
          <ChoiceGrid options={cur.opts} selected={null} onSelect={v=>pick(cur.key,v)} color={cur.color} colorL={cur.bg} colorB={cur.border}/>
        </div>
      )}

      {stage==="deciding"&&done&&(
        <div style={{background:T.goldL,border:`2px solid ${T.goldB}`,borderRadius:10,padding:"20px 24px",textAlign:"center"}}>
          <div style={{fontSize:15,fontWeight:800,color:T.text,marginBottom:6}}>All decisions made.</div>
          <div style={{fontSize:13,color:T.mid,marginBottom:16,lineHeight:1.6}}>AI will generate 4 different hook options. Pick the one you like, edit if needed, then generate the full brief.</div>
          <Btn onClick={generateHooks} disabled={loading}>{loading?"Generating...":"Generate Hooks"}</Btn>
        </div>
      )}

      {stage==="hooks"&&(
        <div>
          {loading&&<div style={{background:T.goldL,border:`1.5px solid ${T.goldB}`,borderRadius:8,padding:"16px",textAlign:"center",fontSize:13,color:T.gold,marginBottom:16}}>Generating hooks...</div>}
          {!loading&&hooks.length>0&&(
            <div>
              <div style={{fontSize:14,fontWeight:800,color:T.text,marginBottom:4}}>Pick your hook</div>
              <div style={{fontSize:12,color:T.mid,marginBottom:14}}>Click the one that feels closest. Edit if needed, then generate the full brief.</div>
              {hooks.map((h,i)=>{
                const isChosen=chosen===i;
                return(
                  <div key={i} onClick={()=>{setChosen(i);setEditedHook(h.hook_text);}}
                    style={{background:isChosen?T.goldL:T.surface,border:`2px solid ${isChosen?T.goldB:T.border}`,borderRadius:9,padding:"14px 18px",marginBottom:10,cursor:"pointer"}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                      <div style={{width:22,height:22,borderRadius:"50%",background:isChosen?T.goldB:T.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#fff",flexShrink:0,marginTop:1}}>{i+1}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:14,fontWeight:700,color:T.text,lineHeight:1.5,marginBottom:4}}>{h.hook_text}</div>
                        {h.hook_visual&&<div style={{fontSize:11,color:T.mid,marginBottom:2}}><b style={{color:T.gold}}>Visual: </b>{h.hook_visual}</div>}
                        {h.hook_audio&&h.hook_audio!=="N/A"&&<div style={{fontSize:11,color:T.mid}}><b style={{color:T.gold}}>Audio: </b>{h.hook_audio}</div>}
                      </div>
                    </div>
                    {isChosen&&(
                      <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${T.goldB}40`}}>
                        <div style={{fontSize:11,color:T.gold,fontWeight:700,marginBottom:6}}>Edit hook text if needed:</div>
                        <textarea value={editedHook} onChange={e=>setEditedHook(e.target.value)} rows={2}
                          style={{width:"100%",background:T.surface,border:`1.5px solid ${T.goldB}`,borderRadius:6,padding:"8px 12px",fontSize:13,color:T.text,fontFamily:"Georgia,serif",resize:"vertical",outline:"none",boxSizing:"border-box",lineHeight:1.6}}/>
                      </div>
                    )}
                  </div>
                );
              })}
              <div style={{display:"flex",gap:10,marginTop:8}}>
                <Btn onClick={generateBrief} disabled={chosen===null||loading} style={{flex:1}}>{loading?"Generating brief...":"Generate Brief ->"}</Btn>
                <Btn onClick={generateHooks} disabled={loading} variant="secondary">More Hooks</Btn>
              </div>
            </div>
          )}
        </div>
      )}

      {stage==="brief"&&(
        <div>
          {loading&&<div style={{background:T.blueL,border:`1.5px solid ${T.blue}`,borderRadius:8,padding:"16px",textAlign:"center",fontSize:13,color:T.blue,marginBottom:16}}>Generating brief...</div>}
          {!loading&&brief&&!brief.error&&(
            <div style={{background:T.surface,border:`2px solid ${T.goldB}`,borderRadius:10,overflow:"hidden"}}>
              <div style={{background:T.goldL,padding:"12px 18px",borderBottom:`1px solid ${T.goldB}50`,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                <div>
                  <div style={{fontSize:14,fontWeight:800,color:T.gold}}>Creator Brief</div>
                  <div style={{fontSize:11,color:T.mid,marginTop:2}}>All fields editable below</div>
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {!alreadySaved&&<Btn onClick={saveBrief} variant="secondary" style={{fontSize:11,padding:"6px 12px"}}>Save Brief</Btn>}
                  {alreadySaved&&<span style={{fontSize:11,color:T.green,fontWeight:700}}>Saved</span>}
                  <Btn onClick={copyBrief} variant="secondary" style={{fontSize:11,padding:"6px 12px"}}>{copied?"Copied!":"Copy Text"}</Btn>
                </div>
              </div>
              <div style={{padding:"18px 22px"}}>
                <Lbl c={T.gold}>Hook</Lbl>
                <div style={{background:T.goldL,border:`1.5px solid ${T.goldB}`,borderRadius:8,padding:"12px 16px",marginBottom:14}}>
                  <EField label="Hook Text" val={brief.hook_text} onChange={v=>setBrief(p=>({...p,hook_text:v}))} color={T.gold}/>
                  <EField label="Visual (0-3s)" val={brief.hook_visual} onChange={v=>setBrief(p=>({...p,hook_visual:v}))} color={T.gold}/>
                  {brief.hook_audio!=="N/A"&&<EField label="Audio" val={brief.hook_audio} onChange={v=>setBrief(p=>({...p,hook_audio:v}))} color={T.gold}/>}
                </div>
                <div style={{background:T.warm,borderLeft:`3px solid ${T.goldB}`,padding:"10px 14px",borderRadius:"0 6px 6px 0",marginBottom:14}}>
                  <EField label="Aha Moment" val={brief.aha} onChange={v=>setBrief(p=>({...p,aha:v}))} color={T.gold} multi rows={2}/>
                </div>
                <Lbl c={T.blue}>Ad Body - GBP</Lbl>
                {[["GUT (0-3s)","gut",T.orange],["BRAIN A (3-8s)","brain_a",T.blue],["BRAIN B (8-15s)","brain_b",T.purple],["POCKET","pocket",T.green]].map(([l,k,c])=>(
                  <div key={k} style={{borderLeft:`4px solid ${c}`,paddingLeft:12,marginBottom:12}}>
                    <EField label={l} val={brief[k]} onChange={v=>setBrief(p=>({...p,[k]:v}))} color={c} multi rows={2}/>
                  </div>
                ))}
                <Divider/>
                <EField label="Brief Overview" val={brief.overview} onChange={v=>setBrief(p=>({...p,overview:v}))} color={T.purple} multi rows={3}/>
                <EList label="Dos" items={brief.dos} onChange={(i,v)=>setBrief(p=>({...p,dos:p.dos.map((x,idx)=>idx===i?v:x)}))} color={T.green}/>
                <EList label="Donts" items={brief.donts} onChange={(i,v)=>setBrief(p=>({...p,donts:p.donts.map((x,idx)=>idx===i?v:x)}))} color={T.red}/>
                <EList label="B-Roll" items={brief.broll} onChange={(i,v)=>setBrief(p=>({...p,broll:p.broll.map((x,idx)=>idx===i?v:x)}))} color={T.blue}/>
                <EField label="Casting" val={brief.casting} onChange={v=>setBrief(p=>({...p,casting:v}))} color={T.orange} multi rows={2}/>
                <EList label="Variations" items={brief.variations} onChange={(i,v)=>setBrief(p=>({...p,variations:p.variations.map((x,idx)=>idx===i?v:x)}))} color={T.purple}/>
                <EField label="Filming Spec" val={brief.filming} onChange={v=>setBrief(p=>({...p,filming:v}))} color={T.dim} multi rows={2}/>
                <div style={{display:"flex",gap:10,marginTop:16}}>
                  <button onClick={()=>{setStage("hooks");setBrief(null);}} style={{flex:1,background:T.warm,color:T.mid,border:`1.5px solid ${T.border}`,borderRadius:7,padding:10,fontSize:12,fontWeight:700,cursor:"pointer"}}>Back to Hooks</button>
                  <button onClick={reset} style={{flex:1,background:T.warm,color:T.mid,border:`1.5px solid ${T.border}`,borderRadius:7,padding:10,fontSize:12,fontWeight:700,cursor:"pointer"}}>Start Over</button>
                </div>
              </div>
            </div>
          )}
          {brief?.error&&<div style={{background:T.redL,color:T.red,padding:"12px 16px",borderRadius:7,fontSize:13,marginTop:8}}>Could not generate brief. <button onClick={generateBrief} style={{background:"none",border:"none",color:T.red,cursor:"pointer",textDecoration:"underline"}}>Try again</button></div>}
        </div>
      )}

      {savedHooks.length>0&&(
        <div style={{marginTop:24}}>
          <Divider/>
          <div style={{fontSize:14,fontWeight:800,color:T.text,marginBottom:12}}>Saved Briefs ({savedHooks.length})</div>
          {savedHooks.map((h,i)=>(
            <div key={i} onClick={()=>{setBrief(h);setSel(h.selections||sel);setStage("brief");window.scrollTo({top:0,behavior:"smooth"});}}
              style={{background:T.warm,border:"1.5px solid "+T.border,borderRadius:7,padding:"12px 16px",marginBottom:8,cursor:"pointer",transition:"border-color 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=T.goldB}
              onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:4}}>"{h.hook_text}"</div>
                  <div style={{fontSize:11,color:T.dim}}>{h.selections?.format} {h.selections?.subtype} | {h.selections?.awareness} | {h.date}</div>
                </div>
                <div style={{fontSize:11,color:T.gold,fontWeight:700,flexShrink:0}}>Open</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


// ── TREE TAB ──────────────────────────────────────────────────────────────────
function TreeTab({brand,onRunInHookBuilder}){
  const b=brand;
  const cp=b.core_persona||{};
  const sp=b.secondary_persona||{};

  const Node=({label,sub,color=T.gold,colorL=T.goldL,colorB=T.goldB,dim=false,small=false})=>(
    <div style={{background:dim?T.warm:colorL,border:`2px solid ${dim?T.border:colorB}`,borderRadius:8,padding:small?"7px 14px":"10px 18px",textAlign:"center",opacity:dim?0.5:1,display:"inline-block"}}>
      <div style={{fontSize:small?11:13,fontWeight:700,color:dim?T.dim:color,whiteSpace:"nowrap"}}>{label}</div>
      {sub&&<div style={{fontSize:10,color:dim?T.dim:color,marginTop:2,whiteSpace:"nowrap"}}>{sub}</div>}
    </div>
  );

  const Line=({height=20})=><div style={{width:2,height,background:T.borderMid,margin:"0 auto"}}/>;
  const Row=({children,gap=16})=><div style={{display:"flex",justifyContent:"center",gap,alignItems:"flex-start"}}>{children}</div>;
  const Col=({children,align="center"})=><div style={{display:"flex",flexDirection:"column",alignItems:align}}>{children}</div>;
  const SectionLabel=({text})=><div style={{fontSize:9,fontWeight:800,letterSpacing:2.5,color:T.dim,textTransform:"uppercase",textAlign:"center",margin:"4px 0 2px"}}>{text}</div>;

  if(!b.name) return <div style={{padding:40,textAlign:"center",color:T.dim,fontSize:14}}>Fill in your Strategy Doc first - the tree will appear here once your brand data is populated.</div>;

  return(
    <div style={{overflowX:"auto",padding:"24px 16px"}}>
      <div style={{minWidth:700,display:"flex",flexDirection:"column",alignItems:"center"}}>

        <SectionLabel text="Brand"/>
        <Node label={b.name||"Brand"} color={T.text} colorL={T.surface} colorB={T.borderMid}/>
        <Line/>

        <SectionLabel text="Organising Idea"/>
        <div style={{background:T.warm,border:`1.5px solid ${T.border}`,borderRadius:8,padding:"10px 20px",maxWidth:500,textAlign:"center",marginBottom:0}}>
          <div style={{fontSize:12,color:T.mid,fontStyle:"italic",lineHeight:1.5}}>{b.organising_idea||"-"}</div>
        </div>
        <Line/>

        <SectionLabel text="Primary Organising Principle"/>
        <Row gap={32}>
          <Node label="Pain-First" sub="Lead with the problem" color={T.red} colorL={T.redL} colorB={T.red} dim={b.primary_principle!=="Pain-First"}/>
          <Node label="Desire-First" sub="Lead with the vision" color={T.gold} colorL={T.goldL} colorB={T.goldB} dim={b.primary_principle!=="Desire-First"}/>
        </Row>
        <Line/>

        <SectionLabel text="Personas"/>
        <Row gap={48}>
          <Col>
            <Node label={cp.name||"Core Persona"} sub="Phase 1 - Core" color={T.green} colorL={T.greenL} colorB={T.green}/>
            {cp.desire&&<div style={{fontSize:11,color:T.green,marginTop:4,textAlign:"center",maxWidth:160}}>Desires: {cp.desire.slice(0,40)}{cp.desire.length>40?"...":""}</div>}
          </Col>
          <Col>
            <Node label={sp.name||"Secondary Persona"} sub="Phase 2" color={T.blue} colorL={T.blueL} colorB={T.blue} dim={!sp.name}/>
            {sp.desire&&<div style={{fontSize:11,color:T.blue,marginTop:4,textAlign:"center",maxWidth:160}}>Desires: {sp.desire.slice(0,40)}{sp.desire.length>40?"...":""}</div>}
          </Col>
        </Row>
        <Line/>

        <SectionLabel text="Format"/>
        <Row gap={48}>
          <Node label="VIDEO" sub="UGC / Skit / Voiceover / Demo" color={T.blue} colorL={T.blueL} colorB={T.blue}/>
          <Node label="IMAGE" sub="Quote / Us vs Them / Stats" color={T.purple} colorL={T.purpleL} colorB={T.purple}/>
        </Row>
        <Line/>

        <SectionLabel text="Awareness Stage"/>
        <Row gap={8}>
          {AWARENESS.map(a=>{
            const cols={Unaware:{c:T.red,bg:T.redL,b:T.red},"Problem Aware":{c:T.orange,bg:T.orangeL,b:T.orange},"Solution Aware":{c:T.gold,bg:T.goldL,b:T.goldB},"Product Aware":{c:T.blue,bg:T.blueL,b:T.blue},"Most Aware":{c:T.green,bg:T.greenL,b:T.green}}[a]||{c:T.dim,bg:T.warm,b:T.border};
            return <Node key={a} label={a} color={cols.c} colorL={cols.bg} colorB={cols.b} small/>;
          })}
        </Row>
        <Line/>

        {(b.concepts||[]).length>0&&(
          <>
            <SectionLabel text="Saved Concepts"/>
            <Row gap={12} style={{flexWrap:"wrap",maxWidth:700}}>
              {b.concepts.map((c,i)=>{
                const pc={"Feeling First":{c:T.gold,bg:T.goldL,b:T.goldB},"Understanding First":{c:T.blue,bg:T.blueL,b:T.blue},"Proof First":{c:T.purple,bg:T.purpleL,b:T.purple}}[c.persuasion]||{c:T.dim,bg:T.warm,b:T.border};
                return(
                  <Col key={i}>
                    <div style={{background:pc.bg,border:`2px solid ${pc.b}`,borderRadius:8,padding:"10px 14px",textAlign:"center",minWidth:140,maxWidth:180}}>
                      <div style={{fontSize:12,fontWeight:800,color:pc.c,marginBottom:4}}>{c.name}</div>
                      <div style={{fontSize:10,color:pc.c,marginBottom:3}}>{c.persuasion}</div>
                      <div style={{fontSize:10,color:T.dim}}>{c.awareness}</div>
                      <div style={{fontSize:10,color:T.mid,marginTop:4,fontStyle:"italic",lineHeight:1.4}}>{c.angle}</div>
                    </div>
                    <Line height={10}/>
                    <button onClick={()=>onRunInHookBuilder&&onRunInHookBuilder(c)}
                      style={{background:T.text,border:"none",borderRadius:6,padding:"8px 14px",cursor:"pointer",width:"100%",maxWidth:180}}>
                      <div style={{fontSize:9,color:"#fff",fontWeight:800,letterSpacing:1.5,textTransform:"uppercase"}}>Run in Hook Builder</div>
                    </button>
                  </Col>
                );
              })}
            </Row>
          </>
        )}

        {(b.concepts||[]).length===0&&(
          <div style={{background:T.warm,border:`1.5px dashed ${T.border}`,borderRadius:8,padding:"16px 24px",textAlign:"center",maxWidth:400}}>
            <div style={{fontSize:12,color:T.dim}}>Generate and save concepts in the Strategy Doc tab - they will appear here in the tree.</div>
          </div>
        )}

        <Line height={8}/>
        <SectionLabel text="Hook Builder"/>
        <div style={{background:T.text,borderRadius:8,padding:"10px 20px",textAlign:"center"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>Select a concept -> run through Hook Builder -> get complete hook + brief</div>
        </div>
      </div>
    </div>
  );
}

// ── PHASE 2 TAB ───────────────────────────────────────────────────────────────
function Phase2Tab(){
  return(
    <div style={{maxWidth:700,margin:"0 auto"}}>
      <div style={{fontSize:18,fontWeight:800,color:T.text,marginBottom:6}}>Phase 2 Plan</div>
      <div style={{fontSize:13,color:T.mid,marginBottom:20}}>Only begin when Phase 1 has a winner running profitably. One layer at a time. Never two simultaneously.</div>
      {[{level:"L0",label:"Same concept, format variation",desc:"Same script, different editing style or aspect ratio. Almost free to produce.",color:T.green},{level:"L1",label:"Same concept, hook variation",desc:"Same body from beat 2. Only opening line changes. One filming session.",color:T.blue},{level:"L2",label:"Same concept, angle variation",desc:"Same concept territory, different angle within it. Proven format.",color:T.gold},{level:"L3",label:"New concept, proven format",desc:"New message territory. Use the format you know works.",color:T.orange},{level:"L4",label:"New concept, new format",desc:"Both tested simultaneously. Higher risk. L0-L3 must be profitable first.",color:T.purple},{level:"L5",label:"Completely new territory",desc:"New concept, format, and persona. Only for scaling profitable accounts.",color:T.red}].map(({level,label,desc,color})=>(
        <div key={level} style={{background:T.surface,border:`1.5px solid ${T.border}`,borderLeft:`5px solid ${color}`,borderRadius:6,padding:"13px 18px",marginBottom:10,display:"flex",gap:14}}>
          <div style={{fontSize:15,fontWeight:900,color,minWidth:28,paddingTop:1}}>{level}</div>
          <div><div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:3}}>{label}</div><div style={{fontSize:12,color:T.mid}}>{desc}</div></div>
        </div>
      ))}
      <Divider/>
      <div style={{fontSize:14,fontWeight:800,color:T.text,marginBottom:14}}>When Data Comes In</div>
      {[{s:"Scenario A — No winners",a:"Diagnose first: wrong message, wrong format, or wrong audience. Identify which one before acting.",c:T.red},{s:"Scenario B — One or two winners",a:"Protect the winner. Do not touch it. Find what made it win. Iterate one variable at a time. Build next concept in parallel (90/10 rule).",c:T.gold},{s:"Scenario C — Strong winner + good CPA",a:"You have a foundation. Every phase from here adds exactly one layer to what is already proven.",c:T.green}].map(({s,a,c})=>(
        <div key={s} style={{background:T.surface,border:`1.5px solid ${T.border}`,borderTop:`3px solid ${c}`,borderRadius:8,padding:"14px 18px",marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:800,color:c,marginBottom:6}}>{s}</div>
          <div style={{fontSize:12,color:T.mid,lineHeight:1.6}}>{a}</div>
        </div>
      ))}
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App(){
  const [brand,setBrand]=useState(null);
  const [tab,setTab]=useState("doc");
  const [savedHooks,setSavedHooks]=useState([]);
  const [activeConcept,setActiveConcept]=useState(null);

  const runInHookBuilder=(c)=>{setActiveConcept(c);setTab("hooks");};

  const saveBrandJSON=()=>{
    const data={brand,savedHooks};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download=`${brand.name||"brand"}-strategy.json`;
    a.click();URL.revokeObjectURL(url);
  };

  if(!brand)return <Setup onDone={d=>{setBrand(d);if(d.savedHooks)setSavedHooks(d.savedHooks);}}/>;

  const TABS=[{id:"doc",label:"Strategy Doc"},{id:"tree",label:"Strategy Tree"},{id:"hooks",label:"Hook Builder"},{id:"phase2",label:"Phase 2"}];

  return(
    <div style={{background:T.bg,minHeight:"100vh",fontFamily:"Georgia,'Times New Roman',serif",color:T.text}}>
      <div style={{background:T.surface,borderBottom:`2px solid ${T.border}`,padding:"14px 24px",position:"sticky",top:0,zIndex:10}}>
        <div style={{maxWidth:700,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div>
              <div style={{fontSize:10,letterSpacing:3,color:T.dim,textTransform:"uppercase"}}>Creative Room</div>
              <div style={{fontSize:20,fontWeight:800,color:T.text}}>{brand.name||"Untitled Brand"}</div>
            </div>
            {brand.primary_principle&&<Chip label={brand.primary_principle}/>}
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <Btn onClick={saveBrandJSON} variant="secondary" style={{fontSize:11,padding:"6px 12px"}}>dl Save Brand JSON</Btn>
            <Btn onClick={()=>{setBrand(null);setSavedHooks([]);}} variant="secondary" style={{fontSize:11,padding:"6px 12px"}}>Switch Brand</Btn>
          </div>
        </div>
        <div style={{maxWidth:700,margin:"10px auto -15px",display:"flex"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:tab===t.id?T.gold:T.dim,background:"transparent",border:"none",borderBottom:tab===t.id?`3px solid ${T.goldB}`:"3px solid transparent",padding:"7px 16px",cursor:"pointer"}}>{t.label}</button>
          ))}
        </div>
      </div>
      <div style={{padding:"28px 24px"}}>
        {tab==="doc"&&<DocTab brand={brand} set={setBrand}/>}
        {tab==="tree"&&<TreeTab brand={brand} onRunInHookBuilder={runInHookBuilder}/>}
        {tab==="hooks"&&<HookTab brand={brand} savedHooks={savedHooks} setSavedHooks={setSavedHooks} activeConcept={activeConcept} clearActiveConcept={()=>setActiveConcept(null)}/>}
        {tab==="phase2"&&<Phase2Tab/>}
      </div>
    </div>
  );
}
