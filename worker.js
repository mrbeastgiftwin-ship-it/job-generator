
const PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Seventimenews Job Generator</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:#f4f7f9;color:#172638;font-family:Arial,sans-serif}
header{background:#172638;color:white;padding:24px;text-align:center}
main{max-width:1100px;margin:25px auto;padding:15px;display:grid;grid-template-columns:1fr 1fr;gap:20px}
.panel{background:white;padding:22px;border-radius:14px;border:1px solid #ddd}
h2{font-size:19px}
label{display:block;font-weight:bold;margin:13px 0 6px}
input,textarea{width:100%;padding:12px;border:1px solid #ccc;border-radius:8px;font:inherit}
textarea{min-height:120px}
button{padding:12px 17px;border:0;border-radius:8px;cursor:pointer;font-weight:bold}
.primary{background:#08ad78;color:white;width:100%;margin-top:14px}
.secondary{background:#e7f5ef;color:#087a57;margin:5px}
.tabs{display:flex;gap:8px;margin:15px 0}
.tab{background:#eee;color:#333}
.tab.active{background:#08ad78;color:white}
.hidden{display:none}
.status{font-size:13px;color:#64748b;margin-top:12px}
.preview{border:1px solid #ddd;border-radius:12px;overflow:hidden}
.preview img{width:100%;height:190px;object-fit:cover;background:#eee}
.content{padding:18px}
.info{background:#f1f5f9;padding:12px;margin:10px 0;border-radius:8px}
.apply{display:block;text-align:center;background:#08ad78;color:white;padding:14px;text-decoration:none;border-radius:8px;margin-top:18px;font-weight:bold}
pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#172638;color:white;padding:14px;border-radius:8px;max-height:300px;overflow:auto;font-size:12px}
@media(max-width:750px){main{grid-template-columns:1fr}}
</style>
</head>
<body>

<header>
<h2>Seventimenews Job Generator</h2>
<p>AI Job Post Creator</p>
</header>

<main>
<section class="panel">

<h2>1. Select Input Method</h2>

<div class="tabs">
<button class="tab active" id="autoTab">Automatic URL</button>
<button class="tab" id="manualTab">Manual Paste</button>
</div>

<div id="autoPanel">
<label>Original Job URL</label>
<input id="jobUrl" placeholder="https://example.com/job">
<button class="primary" id="extract">Extract Job Details</button>
</div>

<div id="manualPanel" class="hidden">
<label>Paste Job Description</label>
<textarea id="source" placeholder="Paste complete job description here"></textarea>
<button class="primary" id="useText">Use This Text</button>
</div>

<p class="status" id="status">Ready.</p>

<hr>

<h2>2. Job Information</h2>

<label>Job Title</label>
<input id="title" placeholder="Electrician">

<label>Category</label>
<input id="category" placeholder="Electrical / Maintenance">

<label>Location</label>
<input id="location" placeholder="Sweden">

<label>Salary</label>
<input id="salary" placeholder="Not Disclosed">

<label>Job Type</label>
<input id="type" placeholder="Full-time">

<label>Experience</label>
<input id="experience" placeholder="2 Years">

<label>Job Description</label>
<textarea id="description" placeholder="Job description"></textarea>

<label>Generated Image URL</label>
<input id="image" placeholder="https://image-url">

<label>Original Apply URL</label>
<input id="applyUrl" placeholder="https://company.com/apply">

<button class="primary" id="generate">Generate Preview & HTML</button>

</section>

<section class="panel">

<h2>3. Live Preview</h2>

<div class="preview">
<img id="previewImage" src="https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=1200&q=80">

<div class="content">
<h2 id="previewTitle">Job Title</h2>

<div class="info" id="line1">
Job Title | Category
</div>

<div class="info" id="line2">
(!!!) Location | Salary | Job Type | Experience
</div>

<p id="previewDescription">Job description will appear here.</p>

<a class="apply" id="applyButton" href="#" target="_blank" rel="noopener noreferrer">
Apply Now
</a>
</div>
</div>

<h2 style="margin-top:25px">4. HTML Output</h2>

<pre id="output">Your HTML will appear here.</pre>

<button class="secondary" id="copy">Copy HTML</button>
<button class="secondary" id="download">Download HTML</button>

</section>
</main>

<script>
const $=id=>document.getElementById(id);

function status(t){$("status").textContent=t}

$("autoTab").onclick=()=>{
 $("autoPanel").classList.remove("hidden");
 $("manualPanel").classList.add("hidden");
 $("autoTab").classList.add("active");
 $("manualTab").classList.remove("active");
};

$("manualTab").onclick=()=>{
 $("manualPanel").classList.remove("hidden");
 $("autoPanel").classList.add("hidden");
 $("manualTab").classList.add("active");
 $("autoTab").classList.remove("active");
};

function parseJob(text){
 const patterns={
 location:/(?:location|based in|workplace)\s*[:\-]\s*([^\n]+)/i,
 salary:/(?:salary|pay|compensation)\s*[:\-]\s*([^\n]+)/i,
 type:/(?:job type|employment type|contract)\s*[:\-]\s*([^\n]+)/i,
 experience:/(?:experience|required experience)\s*[:\-]\s*([^\n]+)/i
 };

 for(const key in patterns){
  const m=text.match(patterns[key]);
  if(m)$(key).value=m[1].trim();
 }

 const lines=text.split(/\n/).map(x=>x.trim()).filter(Boolean);
 if(lines.length&&!$("title").value){
  $("title").value=lines[0].slice(0,100);
 }
 $("description").value=text.slice(0,6000);
}

$("extract").onclick=async()=>{
 const url=$("jobUrl").value.trim();

 if(!/^https?:\/\//i.test(url)){
  status("Please enter a valid job URL.");
  return;
 }

 status("Reading job website...");

 try{
  const response=await fetch("/api/extract?url="+encodeURIComponent(url));
  const data=await response.json();

  if(!response.ok)throw new Error(data.error);

  parseJob(data.text);
  $("applyUrl").value=url;
  status("Information extracted. Please check the details.");

 }catch(e){
  status("Automatic extraction failed. Please use Manual Paste.");
 }
};

$("useText").onclick=()=>{
 const text=$("source").value.trim();

 if(!text){
  status("Please paste the job description.");
  return;
 }

 parseJob(text);

 if(!$("applyUrl").value){
  $("applyUrl").value=$("jobUrl").value;
 }

 status("Job text loaded. Check the information.");
};

function esc(s){
 return String(s||"").replace(/[&<>"']/g,c=>({
 "&":"&amp;","<":"&lt;",">":"&gt;",
 '"':"&quot;","'":"&#39;"
 }[c]));
}

$("generate").onclick=()=>{
 const title=$("title").value.trim()||"Job Title";
 const category=$("category").value.trim()||"Not Disclosed";
 const location=$("location").value.trim()||"Not Disclosed";
 const salary=$("salary").value.trim()||"Not Disclosed";
 const type=$("type").value.trim()||"Not Disclosed";
 const experience=$("experience").value.trim()||"Not Disclosed";
 const description=$("description").value.trim()||"Job description not provided.";
 const image=$("image").value.trim();
 const apply=$("applyUrl").value.trim();

 if(apply&&!/^https?:\/\//i.test(apply)){
  status("Invalid Apply URL.");
  return;
 }

 $("previewTitle").textContent=title;
 $("line1").textContent=title+" | "+category;
 $("line2").textContent="(!!!) "+location+" | "+salary+" | "+type+" | "+experience;
 $("previewDescription").textContent=description;

 if(image&&/^https?:\/\//i.test(image)){
  $("previewImage").src=image;
 }

 $("applyButton").href=apply||"#";

 const html=`<article class="job-post">
<img src="${esc(image||"YOUR_IMAGE_URL")}" alt="${esc(title)}" style="width:100%;max-height:360px;object-fit:cover">

<h2>${esc(title)}</h2>

<p><strong>${esc(title)} | ${esc(category)}</strong></p>

<p><strong>(!!!) ${esc(location)} | ${esc(salary)} | ${esc(type)} | ${esc(experience)}</strong></p>

<div>${esc(description).replace(/\n/g,"<br>")}</div>

<p>
<a href="${esc(apply||"#")}" target="_blank" rel="noopener noreferrer"
style="display:inline-block;background:#08ad78;color:white;padding:12px 25px;text-decoration:none;border-radius:6px">
Apply Now
</a>
</p>
</article>`;

 $("output").textContent=html;
 status("HTML generated successfully.");
};

$("copy").onclick=async()=>{
 const text=$("output").textContent;
 try{
  await navigator.clipboard.writeText(text);
  status("HTML copied!");
 }catch(e){
  status("Copy failed. Select and copy manually.");
 }
};

$("download").onclick=()=>{
 const text=$("output").textContent;
 const blob=new Blob([text],{type:"text/html"});
 const a=document.createElement("a");
 a.href=URL.createObjectURL(blob);
 a.download="job-post.html";
 a.click();
 URL.revokeObjectURL(a.href);
};
</script>
</body>
</html>`;

function json(data,status=200){
 return new Response(JSON.stringify(data),{
  status,
  headers:{"Content-Type":"application/json"}
 });
}

function cleanText(html){
 return html
 .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi," ")
 .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi," ")
 .replace(/<br\s*\/?>/gi,"\n")
 .replace(/<\/(p|div|li|h[1-6]|tr)>/gi,"\n")
 .replace(/<[^>]+>/g," ")
 .replace(/&nbsp;/gi," ")
 .replace(/&amp;/gi,"&")
 .replace(/&quot;/gi,'"')
 .replace(/&#39;/gi,"'")
 .replace(/[ \t]+/g," ")
 .replace(/\n\s*\n+/g,"\n")
 .trim()
 .slice(0,18000);
}

export default {
 async fetch(request,env){

  const url=new URL(request.url);

  if(url.pathname==="/api/health"){
   return json({ok:true});
  }

  if(url.pathname==="/api/extract"){

   const target=url.searchParams.get("url");

   if(!target)return json({error:"Missing URL"},400);

   let parsed;

   try{
    parsed=new URL(target);
   }catch(e){
    return json({error:"Invalid URL"},400);
   }

   if(!["http:","https:"].includes(parsed.protocol)){
    return json({error:"Only HTTP and HTTPS URLs allowed"},400);
   }

   const host=parsed.hostname.toLowerCase();

   if(
    host==="localhost"||
    host==="127.0.0.1"||
    host==="::1"||
    host.endsWith(".local")||
    host.startsWith("10.")||
    host.startsWith("192.168.")||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host)
   ){
    return json({error:"Private URLs are not allowed"},400);
   }

   try{

    const response=await fetch(parsed.toString(),{
     headers:{
      "User-Agent":"Mozilla/5.0",
      "Accept":"text/html,application/xhtml+xml"
     },
     redirect:"follow",
     signal:AbortSignal.timeout(12000)
    });

    if(!response.ok){
     return json({error:"Website blocked the request. Use Manual Paste."},502);
    }

    const contentType=response.headers.get("content-type")||"";

    if(!contentType.includes("text/html")&&!contentType.includes("text/plain")){
     return json({error:"Page is not readable. Use Manual Paste."},415);
    }

    const body=await response.text();
    const text=cleanText(body);

    if(text.length<80){
     return json({error:"Not enough text found. Use Manual Paste."},422);
    }

    return json({
     text,
     finalUrl:response.url
    });

   }catch(e){
    return json({
     error:"Website could not be accessed. Use Manual Paste."
    },502);
   }
  }

  if(url.pathname==="/"||url.pathname==="/index.html"){
   return new Response(PAGE,{
    headers:{"Content-Type":"text/html;charset=UTF-8"}
   });
  }

  return new Response("Not Found",{status:404});
 }
};
