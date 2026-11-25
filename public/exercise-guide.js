const GUIDE_STEPS={squat:['Stand with feet about shoulder-width apart and hold a dumbbell close to your chest.','Sit down between your hips, keeping your knees tracking over your toes.','Press through your feet to stand tall.'],legpress:['Adjust the seat and place feet flat on the platform.','Release the safety catches as directed by the machine; bend knees within a comfortable range.','Press the platform away without locking your knees; secure the catches before exiting.'],lunge:['Stand tall with feet hip-width apart.','Step one foot back and lower both knees comfortably.','Push through the front foot to return; alternate sides.'],bridge:['Lie on your back with knees bent and feet flat.','Brace your abdomen and squeeze your glutes to lift your hips.','Pause, then lower slowly without arching your back.'],hipthrust:['Place upper back against a stable bench and feet flat on the floor.','Brace your trunk and drive through your feet to lift your hips.','Squeeze glutes at the top, then lower with control.'],row:['Sit tall with feet supported and grasp the cable handle.','Draw elbows back toward your ribs without rocking your torso.','Slowly extend your arms to the start.'],pulldown:['Adjust the thigh pad and grip the bar comfortably.','Pull elbows down toward your sides, bringing the bar toward your upper chest.','Return slowly without swinging.'],pushup:['Place hands on a stable elevated surface and step feet back.','Keep your body straight as you bend elbows and lower your chest.','Press away to return to the start.'],chestpress:['Adjust the seat so handles are near chest height.','Keep your back supported and press handles forward.','Return slowly without letting the weights slam.'],shoulder:['Hold dumbbells near shoulder height with feet supported.','Brace your trunk and press overhead within a comfortable range.','Lower slowly without arching your lower back.'],curl:['Stand or sit tall with dumbbells at your sides.','Keep elbows near your ribs and bend them to raise the weights.','Lower slowly without swinging.'],triceps:['Stand facing the cable with elbows tucked near your ribs.','Extend elbows to press the handle down.','Return slowly while keeping upper arms still.'],plank:['Place forearms on the floor with elbows beneath shoulders.','Extend legs or use knees for support; keep your trunk aligned.','Breathe steadily and stop when you cannot maintain form.'],deadbug:['Lie on your back with arms up and knees bent above hips.','Brace gently and extend opposite arm and leg within a controlled range.','Return to the start and alternate sides.']};

function exerciseVisual(ex) {
    const figure = document.createElement("figure");
    figure.className = "exercise-visual exercise-photo";

    const frame = document.createElement("div");
    frame.className = "exercise-image-frame";

    const image = document.createElement("img");
    image.src = "images/" + encodeURIComponent(ex.id) + ".png";
    image.alt = "Illustration of " + ex.name;
    image.loading = "lazy";
    image.decoding = "async";
    image.width = 300;
    image.height = 300;

    const fallback = document.createElement("div");
    fallback.className = "exercise-image-fallback";
    fallback.textContent = "Illustration unavailable";
    fallback.hidden = true;

    image.addEventListener("error", () => {
        image.hidden = true;
        fallback.hidden = false;
    });

    frame.append(image, fallback);

    const caption = document.createElement("figcaption");
    caption.className = "exercise-image-caption";

    const group = document.createElement("span");
    group.className = "exercise-group-label";
    group.textContent = ex.group;

    const level = document.createElement("span");
    level.className = "exercise-level-label";
    level.textContent = ex.level;

    caption.append(group, level);
    figure.append(frame, caption);

    return figure;
}

function exerciseGuideButton(ex) {
 const b=document.createElement('button'); b.type='button'; b.className='secondary-button guide-button fp-guide-action';
 b.setAttribute('aria-label','View technique for '+ex.name); b.setAttribute('aria-haspopup','dialog');
 const img=document.createElement('img'); img.className='fp-guide-thumbnail'; img.src='images/'+encodeURIComponent(ex.id)+'.png'; img.alt=''; img.loading='lazy'; img.onerror=()=>img.remove();
 const copy=document.createElement('span'); copy.className='fp-guide-copy';
 const strong=document.createElement('strong'); strong.textContent='Exercise technique'; const small=document.createElement('small'); small.textContent='Illustration and step-by-step instructions'; copy.append(strong,small);
 const arrow=document.createElement('span'); arrow.className='fp-guide-arrow'; arrow.textContent='›'; arrow.setAttribute('aria-hidden','true'); b.append(img,copy,arrow);
 b.onclick=()=>{
 if(document.querySelector('dialog.guide-dialog[open]'))return;
 const d=document.createElement('dialog'); d.className='guide-dialog'; d.setAttribute('aria-labelledby','guide-title');
 const header=document.createElement('header'); header.className='guide-header';
 const headingBox=document.createElement('div'); const kicker=document.createElement('span'); kicker.className='tag'; kicker.textContent='EXERCISE GUIDE'; const title=document.createElement('h2'); title.id='guide-title'; title.textContent=ex.name; headingBox.append(kicker,title);
 const close=document.createElement('button'); close.type='button'; close.className='guide-close'; close.setAttribute('aria-label','Close exercise guide'); close.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'; close.onclick=()=>d.close(); header.append(headingBox,close);
 const content=document.createElement('div'); content.className='guide-content'; const meta=document.createElement('p'); meta.className='guide-meta'; meta.textContent=ex.group+' · '+ex.equipment+' · '+ex.level;
 const heading=document.createElement('h3'); heading.textContent='How to perform'; const ol=document.createElement('ol'); for(const step of GUIDE_STEPS[ex.id]||[ex.instructions]){const li=document.createElement('li');li.textContent=step;ol.append(li)}
 const tip=document.createElement('p'); tip.className='guide-tip'; const label=document.createElement('strong'); label.textContent='Training tip: '; tip.append(label,'Start with manageable resistance. Stop if you feel sharp pain or cannot maintain control.');
 const link=document.createElement('a'); link.className='guide-video'; link.href='https://www.youtube.com/results?search_query='+encodeURIComponent(ex.name+' proper form tutorial'); link.target='_blank'; link.rel='noopener noreferrer'; link.textContent='Find video demonstrations ↗ (opens YouTube)';
 content.append(meta,exerciseVisual(ex),heading,ol,tip,link); d.append(header,content); document.body.append(d); d.addEventListener('close',()=>{d.remove();b.focus()}); d.showModal(); close.focus();
 }; return b;
}
