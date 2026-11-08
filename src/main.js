// NÁCAR — renderizador 3D por software sobre Canvas 2D.
// No utiliza WebGL, WebGPU, shaders ni bibliotecas gráficas externas.
window.NACAR_BOOT_STARTED=true;
window.NACAR_BOOT_STAGE="Preparando el renderizador 3D por CPU";
(() => {
  "use strict";
  const canvas=document.querySelector("#world");
  const intro=document.querySelector("#intro");
  const startButton=document.querySelector("#start");
  const statusText=document.querySelector("#status-text");
  const message=document.querySelector("#message");
  const errorPanel=document.querySelector("#error-panel");
  const ctx=canvas && canvas.getContext ? canvas.getContext("2d",{alpha:false}) : null;

  if(!ctx){
    window.NACAR_BOOT_FAILED=true;
    errorPanel.hidden=false;
    errorPanel.textContent="Este navegador no ha podido crear un lienzo 2D por software. No se necesita WebGL ni WebGPU, pero Canvas 2D debe estar disponible.";
    return;
  }

  const TAU=Math.PI*2;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const mix=(a,b,t)=>a+(b-a)*t;
  const hex=(n)=>"#"+(n>>>0).toString(16).padStart(6,"0");
  const rgb=(r,g,b)=>"rgb("+clamp(r|0,0,255)+","+clamp(g|0,0,255)+","+clamp(b|0,0,255)+")";
  const colorMix=(c1,c2,t)=>{
    const a=[(c1>>16)&255,(c1>>8)&255,c1&255],b=[(c2>>16)&255,(c2>>8)&255,c2&255];
    return rgb(mix(a[0],b[0],t),mix(a[1],b[1],t),mix(a[2],b[2],t));
  };
  let W=innerWidth,H=innerHeight,DPR=1;
  function resize(){
    W=innerWidth;H=innerHeight;DPR=Math.min(window.devicePixelRatio||1,1.25);
    canvas.width=Math.max(1,Math.floor(W*DPR));canvas.height=Math.max(1,Math.floor(H*DPR));
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }
  resize();window.addEventListener("resize",resize);

  function terrainHeight(x,z){
    return .34*Math.sin(x*.12)*Math.cos(z*.105)+.19*Math.sin(z*.23+x*.07)+.07*Math.cos(x*.31-z*.18);
  }

  const triangles=[];
  function tri(a,b,c,color){triangles.push({a,b,c,color});}
  function quad(a,b,c,d,color){tri(a,b,c,color);tri(a,c,d,color);}
  function box(x,y,z,sx,sy,sz,color){
    const x0=x-sx/2,x1=x+sx/2,y0=y-sy/2,y1=y+sy/2,z0=z-sz/2,z1=z+sz/2;
    const p=[
      [x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],
      [x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]
    ];
    quad(p[0],p[1],p[2],p[3],colorMix(color,0x252820,.10));
    quad(p[5],p[4],p[7],p[6],colorMix(color,0x111713,.20));
    quad(p[4],p[0],p[3],p[7],colorMix(color,0xffffff,.10));
    quad(p[1],p[5],p[6],p[2],colorMix(color,0x121914,.12));
    quad(p[3],p[2],p[6],p[7],colorMix(color,0xffffff,.20));
    quad(p[4],p[5],p[1],p[0],colorMix(color,0x101713,.15));
  }
  function cylinderBetween(a,b,r,color,sides=6){
    const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],len=Math.hypot(dx,dy,dz)||1;
    const d=[dx/len,dy/len,dz/len],helper=Math.abs(d[1])>.9?[0,0,1]:[0,1,0];
    let u=[d[1]*helper[2]-d[2]*helper[1],d[2]*helper[0]-d[0]*helper[2],d[0]*helper[1]-d[1]*helper[0]];
    const ul=Math.hypot(...u)||1;u=u.map(v=>v/ul);
    const v=[d[1]*u[2]-d[2]*u[1],d[2]*u[0]-d[0]*u[2],d[0]*u[1]-d[1]*u[0]];
    for(let i=0;i<sides;i++){
      const a0=i*TAU/sides,a1=(i+1)*TAU/sides;
      const p0=[a[0]+r*(u[0]*Math.cos(a0)+v[0]*Math.sin(a0)),a[1]+r*(u[1]*Math.cos(a0)+v[1]*Math.sin(a0)),a[2]+r*(u[2]*Math.cos(a0)+v[2]*Math.sin(a0))];
      const p1=[a[0]+r*(u[0]*Math.cos(a1)+v[0]*Math.sin(a1)),a[1]+r*(u[1]*Math.cos(a1)+v[1]*Math.sin(a1)),a[2]+r*(u[2]*Math.cos(a1)+v[2]*Math.sin(a1))];
      const q0=[b[0]+r*(u[0]*Math.cos(a0)+v[0]*Math.sin(a0)),b[1]+r*(u[1]*Math.cos(a0)+v[1]*Math.sin(a0)),b[2]+r*(u[2]*Math.cos(a0)+v[2]*Math.sin(a0))];
      const q1=[b[0]+r*(u[0]*Math.cos(a1)+v[0]*Math.sin(a1)),b[1]+r*(u[1]*Math.cos(a1)+v[1]*Math.sin(a1)),b[2]+r*(u[2]*Math.cos(a1)+v[2]*Math.sin(a1))];
      quad(p0,p1,q1,q0,i%2?colorMix(color,0x141b17,.12):color);
    }
  }
  function cone(x,y,z,r,h,color,sides=7){
    const apex=[x,y+h,z];
    for(let i=0;i<sides;i++){
      const a=i*TAU/sides,b=(i+1)*TAU/sides;
      const p=[x+Math.cos(a)*r,y,z+Math.sin(a)*r],q=[x+Math.cos(b)*r,y,z+Math.sin(b)*r];
      tri(p,q,apex,i%2?colorMix(color,0x101a14,.13):color);
    }
    const center=[x,y,z];
    for(let i=0;i<sides;i++){
      const a=i*TAU/sides,b=(i+1)*TAU/sides;
      tri(center,[x+Math.cos(b)*r,y,z+Math.sin(b)*r],[x+Math.cos(a)*r,y,z+Math.sin(a)*r],colorMix(color,0x152018,.18));
    }
  }
  function ellipsoid(cx,cy,cz,rx,ry,rz,color,segments=8,rings=5){
    const rows=[];
    for(let j=0;j<=rings;j++){
      const lat=-Math.PI/2+Math.PI*j/rings,cl=Math.cos(lat),sl=Math.sin(lat),row=[];
      for(let i=0;i<=segments;i++){
        const lon=TAU*i/segments;
        row.push([cx+rx*cl*Math.cos(lon),cy+ry*sl,cz+rz*cl*Math.sin(lon)]);
      }
      rows.push(row);
    }
    for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){
      const shade=((i+j)%5===0)?colorMix(color,0xffffff,.08):color;
      quad(rows[j][i],rows[j][i+1],rows[j+1][i+1],rows[j+1][i],shade);
    }
  }

  // Terreno de altura variable: cada celda se compone de dos triángulos.
  const grid=26,extent=84,step=extent*2/grid,groundLow=0x304638,groundHigh=0x78805a;
  const gridPts=[];
  for(let iz=0;iz<=grid;iz++){
    const row=[];
    for(let ix=0;ix<=grid;ix++){
      const x=-extent+ix*step,z=-extent+iz*step,y=terrainHeight(x,z);
      row.push([x,y,z]);
    }
    gridPts.push(row);
  }
  for(let z=0;z<grid;z++)for(let x=0;x<grid;x++){
    const p00=gridPts[z][x],p10=gridPts[z][x+1],p11=gridPts[z+1][x+1],p01=gridPts[z+1][x];
    const variation=(Math.sin(x*12.7+z*4.1)+Math.cos(x*3.3-z*8.8))*.035+.10;
    const base=colorMix(groundLow,groundHigh,clamp(variation+((p00[1]+p11[1])*.18),.03,.42));
    const alt=(x+z)%4===0?colorMix(base,0xc3b77d,.10):base;
    quad(p00,p10,p11,p01,alt);
  }

  // Cordillera lejana y rocas de fondo.
  let seed=7341;
  function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
  for(let i=0;i<9;i++){
    const x=-82+i*20,z=-78-(i%3)*8,h=18+rand()*17,r=11+rand()*9;
    cone(x,terrainHeight(x,z)-1,z,r,h,colorMix(0x596c62,0x263b34,rand()*.25),5);
  }

  // Bosque procedimental. Se evita despejar la zona inicial y el arco antiguo.
  const leafPalette=[0x294b38,0x365a3e,0x526b45,0x61734a,0x3d6548];
  for(let i=0;i<48;i++){
    const x=(rand()-.5)*145,z=(rand()-.5)*145;
    if(Math.hypot(x,z-8)<12 || (Math.abs(x)<6&&z<-15&&z>-34))continue;
    const y=terrainHeight(x,z),h=3.8+rand()*4.5,trunk=.16+rand()*.14;
    cylinderBetween([x,y,z],[x,y+h*.56,z],trunk,0x594535,6);
    const leaf=leafPalette[Math.floor(rand()*leafPalette.length)];
    cone(x,y+h*.25,z,1.15+rand()*.65,h*.76,leaf,7);
    if(rand()>.62)cone(x,y+h*.58,z,.82+rand()*.38,h*.42,colorMix(leaf,0x8b9860,.08),7);
  }
  for(let i=0;i<24;i++){
    const x=(rand()-.5)*125,z=(rand()-.5)*125;
    if(Math.hypot(x,z-8)<8)continue;
    const y=terrainHeight(x,z),r=.45+rand()*1.05;
    ellipsoid(x,y+r*.42,z,r*1.1,r*.75,r,0x77796e,6,4);
  }
  // Pequeñas hierbas altas que rompen la uniformidad del suelo.
  for(let i=0;i<260;i++){
    const x=(rand()-.5)*150,z=(rand()-.5)*150;
    if(Math.hypot(x,z-8)<7)continue;
    const y=terrainHeight(x,z),h=.22+rand()*.42,w=.045+rand()*.035;
    const c=rand()>.5?0x81915b:0x9a9a62;
    tri([x-w,y,z],[x+w,y,z],[x+rand()*.12,y+h,z],c);
  }

  // Arco de piedra antiguo delante del punto de partida.
  const archZ=-25,archY=terrainHeight(0,archZ);
  box(-3.15,archY+2.8,archZ,1.15,5.6,1.4,0x858477);
  box(3.15,archY+2.8,archZ,1.15,5.6,1.4,0x858477);
  box(0,archY+5.75,archZ,7.5,1.1,1.6,0x979382);
  box(0,archY+4.9,archZ,5.5,.22,1.62,0x6c7168);
  // Bloques caídos a los lados de las ruinas.
  box(-5.3,archY+.55,archZ+1.2,2.0,1.0,1.3,0x77796e);
  box(5.1,archY+.35,archZ-1.0,1.5,.7,1.1,0x77796e);

  // Personaje Nara provisional: el cuerpo se reconstruye en cada fotograma.
  const player={x:0,y:terrainHeight(0,8),z:8,heading:0};
  const keys=new Set();
  let pointerLocked=false,yaw=0,pitch=-.12,verticalVelocity=0,grounded=true,crouched=false,moving=false,running=false,currentSpeed=0,animTime=0;
  let cameraX=0,cameraY=3.5,cameraZ=14;
  const WALK_SPEED=3.4,RUN_SPEED=6.2,CROUCH_SPEED=1.65,ACCEL=11,BRAKE=15,GRAVITY=19,JUMP=7.1;
  const cameraTarget=[0,0,0],cameraPos=[0,0,0],cameraForward=[0,0,-1],cameraRight=[1,0,0],cameraUp=[0,1,0];
  const cameraState={focal:1,near:.45};

  function localToWorld(lx,ly,lz){
    const c=Math.cos(player.heading),s=Math.sin(player.heading);
    return [player.x+lx*c+lz*s,player.y+ly,player.z-lx*s+lz*c];
  }
  function addCharacter(){
    const bob=moving&&grounded?Math.abs(Math.sin(animTime*2))*.055:0;
    const torsoY=(crouched?.89:1.22)+bob;
    const torso=localToWorld(0,torsoY,0);
    ellipsoid(torso[0],torso[1],torso[2],.39,crouched?.37:.52,.25,0x9b8060,8,5);
    const head=localToWorld(0,(crouched?1.48:1.92)+bob,0);
    ellipsoid(head[0],head[1],head[2],.27,.29,.27,0xc59c79,8,5);
    const hair=localToWorld(0,(crouched?1.57:2.03)+bob,0);
    ellipsoid(hair[0],hair[1],hair[2],.285,.19,.285,0x292b27,8,4);
    for(const side of [-1,1]){
      const armSwing=moving&&grounded?Math.sin(animTime)*.48:0;
      const shoulder=localToWorld(side*.43,crouched?1.12:1.48,0);
      const hand=localToWorld(side*.48,(crouched?.46:.76)+bob,armSwing*.36);
      cylinderBetween(shoulder,hand,.135,0x9b8060,6);
      const legSwing=moving&&grounded?Math.sin(animTime+(side<0?0:Math.PI))*(running?.72:.43):0;
      const hip=localToWorld(side*.19,crouched?.42:.76,0);
      const knee=localToWorld(side*.19+legSwing*.16,crouched?.18:.39,-legSwing*.35);
      const foot=localToWorld(side*.19+legSwing*.28,.09,-.15-legSwing*.5);
      cylinderBetween(hip,knee,.17,0x343b35,6);
      cylinderBetween(knee,foot,.145,0x343b35,6);
      const bootA=localToWorld(side*.19+legSwing*.28,.12,-.13-legSwing*.5);
      const bootB=localToWorld(side*.19+legSwing*.28,.12,-.42-legSwing*.5);
      cylinderBetween(bootA,bootB,.13,0x272d29,6);
    }
  }

  function setStatus(t){statusText.textContent=t;}
  function requestPointerLock(){
    if(document.pointerLockElement===canvas)return;
    if(!canvas.requestPointerLock){setStatus("Ratón libre · mueve la cámara con el puntero");return;}
    try{const r=canvas.requestPointerLock();if(r&&r.catch)r.catch(()=>setStatus("Haz clic en el mundo para capturar el ratón"));}
    catch(_){setStatus("Haz clic en el mundo para capturar el ratón");}
  }
  document.addEventListener("pointerlockchange",()=>{
    pointerLocked=document.pointerLockElement===canvas;
    if(pointerLocked){setStatus("Explorando · ratón capturado");message.textContent="Ratón capturado · ESC para liberar";}
    else if(intro.classList.contains("hidden")){setStatus("Pausa · haz clic para recuperar la cámara");message.textContent="Haz clic en el mundo para volver a capturar el ratón";}
    else setStatus("Preparado");
  });
  document.addEventListener("pointerlockerror",()=>{setStatus("Ratón libre · haz clic para capturarlo");});
  document.addEventListener("mousemove",e=>{
    if(pointerLocked){yaw-=e.movementX*.0022;pitch=clamp(pitch-e.movementY*.0018,-.72,.38);}
  });
  canvas.addEventListener("mousemove",e=>{
    if(!pointerLocked&&intro.classList.contains("hidden")&&e.buttons===0){
      // Modo de cámara sin captura: también funciona en vistas incrustadas.
    }
  });
  let dragLook=false,lastMouseX=0,lastMouseY=0;
  canvas.addEventListener("mousedown",e=>{if(intro.classList.contains("hidden")&&!pointerLocked){dragLook=true;lastMouseX=e.clientX;lastMouseY=e.clientY;}});
  window.addEventListener("mouseup",()=>dragLook=false);
  window.addEventListener("mousemove",e=>{
    if(dragLook&&!pointerLocked){
      yaw-=(e.clientX-lastMouseX)*.004;pitch=clamp(pitch-(e.clientY-lastMouseY)*.003,-.72,.38);
      lastMouseX=e.clientX;lastMouseY=e.clientY;
    }
  });
  window.addEventListener("keydown",e=>{
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.code))e.preventDefault();
    keys.add(e.code);
    if(e.code==="Space"&&grounded&&!crouched&&intro.classList.contains("hidden")){verticalVelocity=JUMP;grounded=false;}
    if(e.code==="KeyE"&&intro.classList.contains("hidden")){
      message.textContent="Aún no hay mecanismos activados en esta prueba";
      setTimeout(()=>{if(intro.classList.contains("hidden"))message.textContent="Explora las ruinas";},2200);
    }
  });
  window.addEventListener("keyup",e=>keys.delete(e.code));
  window.addEventListener("blur",()=>{keys.clear();dragLook=false;});
  function startGame(){
    intro.classList.add("hidden");setStatus("Entrando en el mundo…");
    message.textContent="WASD para moverte · ratón para mirar · clic para recuperar la cámara · ESC libera";
    requestPointerLock();
  }
  startButton.addEventListener("click",startGame);
  canvas.addEventListener("click",()=>{if(intro.classList.contains("hidden")&&!pointerLocked)requestPointerLock();});

  function updatePlayer(dt){
    crouched=keys.has("ControlLeft")||keys.has("ControlRight");
    const ix=(keys.has("KeyD")?1:0)-(keys.has("KeyA")?1:0);
    const iz=(keys.has("KeyS")?1:0)-(keys.has("KeyW")?1:0);
    moving=ix!==0||iz!==0;
    const forwardX=-Math.sin(yaw),forwardZ=-Math.cos(yaw),rightX=Math.cos(yaw),rightZ=-Math.sin(yaw);
    let dx=rightX*ix+forwardX*(-iz),dz=rightZ*ix+forwardZ*(-iz),len=Math.hypot(dx,dz)||1;
    if(moving){dx/=len;dz/=len;}
    running=(keys.has("ShiftLeft")||keys.has("ShiftRight"))&&!crouched;
    const max=crouched?CROUCH_SPEED:(running?RUN_SPEED:WALK_SPEED);
    currentSpeed=mix(currentSpeed,moving?max:0,1-Math.exp(-(moving?ACCEL:BRAKE)*dt));
    player.x+=dx*currentSpeed*dt;player.z+=dz*currentSpeed*dt;
    const floor=terrainHeight(player.x,player.z);
    verticalVelocity-=GRAVITY*dt;player.y+=verticalVelocity*dt;
    if(player.y<=floor){player.y=floor;verticalVelocity=0;grounded=true;}
    if(moving){const target=Math.atan2(-dx,-dz),delta=Math.atan2(Math.sin(target-player.heading),Math.cos(target-player.heading));player.heading+=delta*(1-Math.exp(-10*dt));}
    if(moving&&grounded)animTime+=dt*currentSpeed*(crouched?2.8:2);
    if(crouched)setStatus("Agachado");else if(!grounded)setStatus("En el aire");else if(moving&&running)setStatus("Corriendo");else if(moving)setStatus("Caminando");else setStatus(pointerLocked?"Explorando":"Pausa");
    message.textContent=crouched?"Movimiento silencioso":"Explora las ruinas";
  }

  function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
  function normalize(v){const l=Math.hypot(v[0],v[1],v[2])||1;return [v[0]/l,v[1]/l,v[2]/l];}
  function updateCamera(dt){
    const h=crouched?1.22:1.68,d=crouched?5.2:5.8;
    cameraTarget[0]=player.x;cameraTarget[1]=player.y+h;cameraTarget[2]=player.z;
    const horizontal=Math.cos(pitch)*d;
    const desiredX=cameraTarget[0]+Math.sin(yaw)*horizontal;
    const desiredY=cameraTarget[1]+Math.sin(pitch)*d+.65;
    const desiredZ=cameraTarget[2]+Math.cos(yaw)*horizontal;
    const smooth=1-Math.exp(-7*dt);
    cameraX=mix(cameraX,desiredX,smooth);cameraY=mix(cameraY,desiredY,smooth);cameraZ=mix(cameraZ,desiredZ,smooth);
    cameraPos[0]=cameraX;cameraPos[1]=cameraY;cameraPos[2]=cameraZ;
    const f=normalize([cameraTarget[0]-cameraX,cameraTarget[1]-cameraY,cameraTarget[2]-cameraZ]);
    const r=normalize(cross(f,[0,1,0]));
    const u=normalize(cross(r,f));
    cameraForward[0]=f[0];cameraForward[1]=f[1];cameraForward[2]=f[2];
    cameraRight[0]=r[0];cameraRight[1]=r[1];cameraRight[2]=r[2];
    cameraUp[0]=u[0];cameraUp[1]=u[1];cameraUp[2]=u[2];
    cameraState.focal=H/(2*Math.tan(62*Math.PI/360));
  }
  function project(p){
    const x=p[0]-cameraX,y=p[1]-cameraY,z=p[2]-cameraZ;
    const cx=x*cameraRight[0]+y*cameraRight[1]+z*cameraRight[2];
    const cy=x*cameraUp[0]+y*cameraUp[1]+z*cameraUp[2];
    const cz=x*cameraForward[0]+y*cameraForward[1]+z*cameraForward[2];
    if(cz<cameraState.near)return null;
    const scale=cameraState.focal/cz;
    return {x:W*.5+cx*scale,y:H*.5-cy*scale,z:cz};
  }

  function drawBackground(){
    const g=ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,"#718c8a");g.addColorStop(.48,"#b7bda9");g.addColorStop(1,"#d2c7a6");
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    const sunX=W*.78,sunY=H*.18,sunR=Math.min(W,H)*.055;
    const glow=ctx.createRadialGradient(sunX,sunY,2,sunX,sunY,sunR*2.8);
    glow.addColorStop(0,"rgba(255,239,195,.7)");glow.addColorStop(1,"rgba(255,239,195,0)");
    ctx.fillStyle=glow;ctx.fillRect(sunX-sunR*3,sunY-sunR*3,sunR*6,sunR*6);
    ctx.fillStyle="rgba(255,235,190,.72)";ctx.beginPath();ctx.arc(sunX,sunY,sunR*.55,0,TAU);ctx.fill();
  }

  function render(){
    drawBackground();
    // Geometría estática más personaje dinámico.
    const savedLength=triangles.length;
    addCharacter();
    const visible=[];
    for(let i=0;i<triangles.length;i++){
      const t=triangles[i];
      const pa=project(t.a),pb=project(t.b),pc=project(t.c);
      if(!pa||!pb||!pc)continue;
      const minX=Math.min(pa.x,pb.x,pc.x),maxX=Math.max(pa.x,pb.x,pc.x);
      const minY=Math.min(pa.y,pb.y,pc.y),maxY=Math.max(pa.y,pb.y,pc.y);
      if(maxX< -50||minX>W+50||maxY< -80||minY>H+80)continue;
      const depth=(pa.z+pb.z+pc.z)/3;
      if(depth>120)continue;
      visible.push({pa,pb,pc,depth,color:t.color});
    }
    triangles.length=savedLength;
    visible.sort((a,b)=>b.depth-a.depth);
    for(const t of visible){
      const fog=clamp((t.depth-38)/105,0,.78);
      const fill=fog>0?colorMix(t.color,0xaeb9ad,fog):hex(t.color);
      ctx.fillStyle=fill;
      ctx.beginPath();ctx.moveTo(t.pa.x,t.pa.y);ctx.lineTo(t.pb.x,t.pb.y);ctx.lineTo(t.pc.x,t.pc.y);ctx.closePath();ctx.fill();
    }
    // Suave viñeta atmosférica, sin filtros ni GPU.
    const vignette=ctx.createRadialGradient(W*.5,H*.45,Math.min(W,H)*.2,W*.5,H*.5,Math.max(W,H)*.78);
    vignette.addColorStop(0,"rgba(10,18,15,0)");vignette.addColorStop(1,"rgba(8,16,14,.27)");
    ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H);
  }

  // Coloca la cámara inicialmente detrás de Nara y renderiza antes de abrir el menú.
  cameraX=0;cameraY=3.4;cameraZ=14;
  updateCamera(1);render();
  let lastTime=0,lastRender=0;
  function frame(now){
    requestAnimationFrame(frame);
    const dt=lastTime?Math.min((now-lastTime)/1000,.05):.016;lastTime=now;
    if(intro.classList.contains("hidden"))updatePlayer(dt);
    updateCamera(dt);
    if(now-lastRender>=32){render();lastRender=now;}
  }
  requestAnimationFrame(frame);
  window.NACAR_BOOT_OK=true;
  window.NACAR_BOOT_FAILED=false;
  window.NACAR_BOOT_STAGE="Mundo 3D por CPU listo";
  window.NACAR_RENDER_MODE="Canvas 2D · software 3D · sin WebGL/WebGPU";
  console.info("NÁCAR: renderizador 3D por software listo; WebGL y WebGPU no se utilizan.");
})();