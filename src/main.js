// Arranque con diagnóstico visible: si falla la descarga del motor 3D, se muestra el error en pantalla.
async function boot(){
const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js");
const canvas=document.querySelector("#world"),intro=document.querySelector("#intro"),startButton=document.querySelector("#start"),statusText=document.querySelector("#status-text"),message=document.querySelector("#message"),errorPanel=document.querySelector("#error-panel");
const scene=new THREE.Scene();scene.background=new THREE.Color(0x9baea7);scene.fog=new THREE.FogExp2(0x9baea7,.012);
const camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.1,350);
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:"high-performance"});}
catch(error){errorPanel.hidden=false;errorPanel.textContent="No se pudo iniciar el motor 3D. Comprueba que Chrome tenga la aceleración gráfica activada y vuelve a cargar la página. Detalle: "+error.message;throw error;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
scene.add(new THREE.HemisphereLight(0xdce9e1,0x435047,2));
const sun=new THREE.DirectionalLight(0xffe4bd,3.2);sun.position.set(-35,55,25);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-55;sun.shadow.camera.right=55;sun.shadow.camera.top=55;sun.shadow.camera.bottom=-55;sun.shadow.normalBias=.035;scene.add(sun);
function terrainHeight(x,z){return .34*Math.sin(x*.12)*Math.cos(z*.105)+.19*Math.sin(z*.23+x*.07)+.07*Math.cos(x*.31-z*.18)}
const terrainGeo=new THREE.PlaneGeometry(240,240,150,150);terrainGeo.rotateX(-Math.PI/2);const pos=terrainGeo.attributes.position,colors=[],low=new THREE.Color(0x344b3d),high=new THREE.Color(0x71805b);
for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),y=terrainHeight(x,z);pos.setY(i,y);const c=low.clone().lerp(high,THREE.MathUtils.clamp((y+.55)/1.1,0,1));colors.push(c.r,c.g,c.b)}
terrainGeo.setAttribute("color",new THREE.Float32BufferAttribute(colors,3));terrainGeo.computeVertexNormals();
// Textura procedural de hierba/tierra: no necesita descargar imágenes externas.
const texCanvas=document.createElement("canvas");texCanvas.width=texCanvas.height=256;const tx=texCanvas.getContext("2d");
tx.fillStyle="#687b4e";tx.fillRect(0,0,256,256);
let texSeed=1947;function texRand(){texSeed=(texSeed*1664525+1013904223)>>>0;return texSeed/4294967296}
for(let i=0;i<18000;i++){const x=texRand()*256,y=texRand()*256,r=.4+texRand()*2.2;tx.fillStyle=texRand()>.48?"rgba(35,57,31,.24)":"rgba(190,174,112,.20)";tx.beginPath();tx.ellipse(x,y,r,r*(.4+texRand()),texRand()*3,0,Math.PI*2);tx.fill()}
const groundTexture=new THREE.CanvasTexture(texCanvas);groundTexture.wrapS=groundTexture.wrapT=THREE.RepeatWrapping;groundTexture.repeat.set(34,34);groundTexture.colorSpace=THREE.SRGBColorSpace;
const ground=new THREE.Mesh(terrainGeo,new THREE.MeshStandardMaterial({map:groundTexture,vertexColors:true,roughness:1}));ground.receiveShadow=true;scene.add(ground);
const ridgeMat=new THREE.MeshStandardMaterial({color:0x596c62,roughness:1});for(let i=0;i<11;i++){const h=13+Math.sin(i*1.7)*5,ridge=new THREE.Mesh(new THREE.ConeGeometry(10+(i%3)*3,h,5),ridgeMat);ridge.position.set(-65+i*14,h*.48-1,-92-(i%2)*12);ridge.rotation.y=i*.7;ridge.receiveShadow=true;scene.add(ridge)}
const trunkMat=new THREE.MeshStandardMaterial({color:0x594535,roughness:1}),leafMats=[0x344f3e,0x49664a,0x5d704a].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:1})),stoneMat=new THREE.MeshStandardMaterial({color:0x77796e,roughness:.96});let seed=7341;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
for(let i=0;i<170;i++){const x=(rand()-.5)*170,z=(rand()-.5)*170;if(Math.hypot(x,z)<9)continue;const y=terrainHeight(x,z);if(rand()>.22){const h=3.2+rand()*4.8,trunk=new THREE.Mesh(new THREE.CylinderGeometry(.16,.32,h*.55,7),trunkMat);trunk.position.set(x,y+h*.275,z);trunk.castShadow=true;scene.add(trunk);const crown=new THREE.Mesh(new THREE.ConeGeometry(1.2+rand()*.8,h*.75,7),leafMats[Math.floor(rand()*leafMats.length)]);crown.position.set(x,y+h*.78,z);crown.castShadow=true;crown.receiveShadow=true;scene.add(crown)}else{const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.55+rand()*1.2,0),stoneMat);rock.position.set(x,y+.25,z);rock.rotation.set(rand(),rand()*3,rand());rock.castShadow=true;scene.add(rock)}}
const ruinMat=new THREE.MeshStandardMaterial({color:0x888778,roughness:.94}),pillarGeo=new THREE.BoxGeometry(1.1,5.6,1.25);for(const x of [-3.1,3.1]){const p=new THREE.Mesh(pillarGeo,ruinMat);p.position.set(x,terrainHeight(x,-24)+2.8,-24);p.castShadow=true;p.receiveShadow=true;scene.add(p)}const lintel=new THREE.Mesh(new THREE.BoxGeometry(7.4,1.1,1.5),ruinMat);lintel.position.set(0,terrainHeight(0,-24)+5.8,-24);lintel.castShadow=true;scene.add(lintel);
// Personaje provisional: se sustituirá por el modelo riggeado de Nara.
const player=new THREE.Group();scene.add(player);const body=new THREE.Group();player.add(body);
const clothMat=new THREE.MeshStandardMaterial({color:0x9b8060,roughness:.92}),darkMat=new THREE.MeshStandardMaterial({color:0x343b35,roughness:.85}),skinMat=new THREE.MeshStandardMaterial({color:0xc59c79,roughness:.82}),hairMat=new THREE.MeshStandardMaterial({color:0x292b27,roughness:.95});
function capsule(r,l,m){const o=new THREE.Mesh(new THREE.CapsuleGeometry(r,l,5,9),m);o.castShadow=true;return o}
const torso=capsule(.36,.62,clothMat);torso.position.y=1.22;body.add(torso);const head=new THREE.Mesh(new THREE.SphereGeometry(.27,16,12),skinMat);head.position.y=1.92;head.castShadow=true;body.add(head);const hair=new THREE.Mesh(new THREE.SphereGeometry(.285,14,10,0,Math.PI*2,0,Math.PI*.58),hairMat);hair.position.y=2.02;hair.castShadow=true;body.add(hair);
const armPivots=[],legPivots=[];for(const side of [-1,1]){const p=new THREE.Group();p.position.set(side*.43,1.52,0);body.add(p);const a=capsule(.13,.56,clothMat);a.position.y=-.34;p.add(a);armPivots.push(p)}for(const side of [-1,1]){const p=new THREE.Group();p.position.set(side*.19,.78,0);body.add(p);const l=capsule(.17,.58,darkMat);l.position.y=-.39;p.add(l);const boot=new THREE.Mesh(new THREE.BoxGeometry(.32,.16,.48),darkMat);boot.position.set(0,-.73,-.09);boot.castShadow=true;p.add(boot);legPivots.push(p)}
player.position.set(0,terrainHeight(0,8),8);player.rotation.y=Math.PI;
const keys=new Set();let pointerLocked=false,yaw=Math.PI,pitch=-.12,verticalVelocity=0,grounded=true,crouched=false,moving=false,currentSpeed=0,animTime=0;const clock=new THREE.Clock(),forward=new THREE.Vector3(),right=new THREE.Vector3(),desired=new THREE.Vector3(),cameraTarget=new THREE.Vector3(),cameraPosition=new THREE.Vector3();
const WALK_SPEED=3.4,RUN_SPEED=6.2,CROUCH_SPEED=1.65,ACCELERATION=11,BRAKING=15,GRAVITY=19,JUMP_FORCE=7.1;
function setStatus(t){statusText.textContent=t}
function updateCamera(dt){const h=crouched?1.22:1.72,d=crouched?5.2:5.8;cameraTarget.set(player.position.x,player.position.y+h,player.position.z);const horizontal=Math.cos(pitch)*d;cameraPosition.set(cameraTarget.x+Math.sin(yaw)*horizontal,cameraTarget.y+Math.sin(pitch)*d+.65,cameraTarget.z+Math.cos(yaw)*horizontal);camera.position.lerp(cameraPosition,1-Math.exp(-7*dt));camera.lookAt(cameraTarget)}
document.addEventListener("pointerlockerror",()=>{setStatus("Chrome ha bloqueado la captura del ratón");message.textContent="Haz clic en el mundo para intentar capturarlo de nuevo"});\ndocument.addEventListener("pointerlockchange",()=>{pointerLocked=document.pointerLockElement===canvas;if(pointerLocked){setStatus("Explorando · ratón capturado");message.textContent="Ratón capturado · ESC para liberar"}else if(!intro.classList.contains("hidden"))setStatus("Preparado");else{setStatus("Pausa · haz clic para recuperar la cámara");message.textContent="Haz clic en el mundo para volver a capturar el ratón"}});
document.addEventListener("mousemove",e=>{if(!pointerLocked)return;yaw-=e.movementX*.0022;pitch=THREE.MathUtils.clamp(pitch-e.movementY*.0018,-.72,.38)});

window.addEventListener("keydown",e=>{if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.code))e.preventDefault();keys.add(e.code);if(e.code==="Space"&&grounded&&!crouched&&intro.classList.contains("hidden")){verticalVelocity=JUMP_FORCE;grounded=false}if(e.code==="KeyE"&&intro.classList.contains("hidden")){message.textContent="Aún no hay mecanismos activados en esta prueba";setTimeout(()=>message.textContent="Explora las ruinas",2200)}});
window.addEventListener("keyup",e=>keys.delete(e.code));window.addEventListener("blur",()=>keys.clear());
function requestGamePointerLock(){
 if(document.pointerLockElement===canvas)return;
 if(!canvas.requestPointerLock){setStatus("Tu navegador no permite capturar el ratón");return}
 try{const result=canvas.requestPointerLock();if(result&&typeof result.catch==="function")result.catch(()=>{setStatus("Haz clic dentro del mundo para capturar el ratón")})}
 catch(error){setStatus("Haz clic dentro del mundo para capturar el ratón")}
}
function startGame(){
 intro.classList.add("hidden");
 setStatus("Entrando en el mundo…");
 message.textContent="WASD para moverte · mueve el ratón para mirar · ESC libera el ratón";
 requestGamePointerLock();
}
startButton.addEventListener("click",startGame);
canvas.addEventListener("click",()=>{if(intro.classList.contains("hidden")&&!pointerLocked)requestGamePointerLock()});
function updatePlayer(dt){crouched=keys.has("ControlLeft")||keys.has("ControlRight");const ix=(keys.has("KeyD")?1:0)-(keys.has("KeyA")?1:0),iz=(keys.has("KeyS")?1:0)-(keys.has("KeyW")?1:0);moving=ix!==0||iz!==0;forward.set(-Math.sin(yaw),0,-Math.cos(yaw));right.set(Math.cos(yaw),0,-Math.sin(yaw));desired.set(0,0,0);if(moving)desired.addScaledVector(right,ix).addScaledVector(forward,-iz).normalize();const running=(keys.has("ShiftLeft")||keys.has("ShiftRight"))&&!crouched,max=crouched?CROUCH_SPEED:running?RUN_SPEED:WALK_SPEED,target=moving?max:0;currentSpeed=THREE.MathUtils.damp(currentSpeed,target,moving?ACCELERATION:BRAKING,dt);player.position.addScaledVector(desired,currentSpeed*dt);
const floor=terrainHeight(player.position.x,player.position.z);verticalVelocity-=GRAVITY*dt;player.position.y+=verticalVelocity*dt;if(player.position.y<=floor){player.position.y=floor;verticalVelocity=0;grounded=true}
if(moving&&desired.lengthSq()>.001){const targetYaw=Math.atan2(-desired.x,-desired.z),angle=THREE.MathUtils.euclideanModulo(targetYaw-player.rotation.y+Math.PI,Math.PI*2)-Math.PI;player.rotation.y+=angle*(1-Math.exp(-10*dt))}
body.position.y=THREE.MathUtils.damp(body.position.y,crouched?-.48:0,12,dt);body.scale.y=THREE.MathUtils.damp(body.scale.y,crouched?.82:1,10,dt);
if(moving&&grounded)animTime+=dt*currentSpeed*(crouched?2.8:2);const swing=moving&&grounded?Math.sin(animTime)*(crouched?.28:running?.78:.48):0;legPivots[0].rotation.x=THREE.MathUtils.damp(legPivots[0].rotation.x,swing,12,dt);legPivots[1].rotation.x=THREE.MathUtils.damp(legPivots[1].rotation.x,-swing,12,dt);armPivots[0].rotation.x=THREE.MathUtils.damp(armPivots[0].rotation.x,-swing*.72,12,dt);armPivots[1].rotation.x=THREE.MathUtils.damp(armPivots[1].rotation.x,swing*.72,12,dt);torso.rotation.x=THREE.MathUtils.damp(torso.rotation.x,crouched?.22:moving?-.035:0,8,dt);
if(crouched)setStatus("Agachado");else if(!grounded)setStatus("En el aire");else if(moving&&running)setStatus("Corriendo");else if(moving)setStatus("Caminando");else setStatus(pointerLocked?"Explorando":"Pausa");message.textContent=crouched?"Movimiento silencioso":"Explora las ruinas"}
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);if(intro.classList.contains("hidden"))updatePlayer(dt);updateCamera(dt);renderer.render(scene,camera)}
updateCamera(1);animate();window.NACAR_BOOT_OK=true;window.addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.6))});
}
boot().catch(error=>{
 window.NACAR_BOOT_FAILED=true;\n const panel=document.querySelector("#error-panel");
 if(panel){panel.hidden=false;panel.textContent="NÁCAR no ha podido iniciar. Error: "+(error&&error.message?error.message:String(error))+". Comprueba la conexión a Internet y recarga la página."}
 console.error("Error al iniciar NÁCAR:",error);
});
