const plan=ensurePlan();
if(plan){
 const grid=document.getElementById('calendarGrid');
 const summary=document.getElementById('planSummary');
 const status=document.getElementById('status');
 const focuses=['Full Body','Upper Body','Lower Body','Push','Pull','Legs','Glutes','Core'];
 const hasAI=plan.days.some(d=>plan.sessions?.[d]?.aiGenerated);
 const hasWorkouts=plan.days.some(d=>(plan.exercises?.[d]||[]).length);
 summary.textContent=`${plan.goal} · ${plan.experience} · ${plan.days.length} training day(s)`;
 const overview=document.getElementById('aiPlanOverview');
 if(overview){
   const heading=overview.querySelector('h2');
   const description=overview.querySelector('p');
   const action=overview.querySelector('a');
   heading.textContent=hasAI?'Your Gemini-powered training week':hasWorkouts?'Your personalized training week':'Build a workout plan with Gemini';
   description.textContent=hasAI?'Your AI recommendations are saved below. Select any day to review exercises, suggested sets and reps, or adjust your workout.':hasWorkouts?'Your saved exercises are shown below. Use the AI Coach to generate a new personalized week based on your goals.':'Tell Gemini what you want to improve and it will suggest workouts for your selected training days.';
   action.textContent=hasAI?'✦ Regenerate with Gemini →':'✦ Build my AI plan →';
 }
 function render(){
  grid.replaceChildren();
  DAYS.forEach(day=>{
   const active=plan.days.includes(day);
   const session=plan.sessions?.[day]||{};
   const exerciseIds=plan.exercises?.[day]||[];
   const card=document.createElement('article');
   card.className='day-card fitpath-day'+(active?'':' rest-card');
   card.style.setProperty('--day-accent',active?({'Glutes':'#b9a1c9','Upper Body':'#94b9b0','Lower Body':'#c9b58a','Legs':'#c9b58a','Core':'#a8b8d4','Push':'#94b9b0','Pull':'#a8b8d4'}[session.focus]||'#a8bd79'):'var(--edge)');const top=document.createElement('div');top.className='fitpath-day-top';
   const h=document.createElement('h2');h.textContent=day;
   const chip=document.createElement('span');chip.className='fitpath-day-chip';
   chip.textContent=!active?'Rest day':session.aiGenerated?'✦ Gemini AI':exerciseIds.length?'Planned':'Not planned';
   top.append(h,chip);card.append(top);
   if(!active){
    const p=document.createElement('p');p.textContent='Recovery and recharge. No workout scheduled.';card.append(p);
   }else{
    const focus=document.createElement('strong');focus.className='fitpath-focus';
    focus.textContent=session.focus||'Choose your workout focus';
    card.append(focus);
    const meta=document.createElement('p');meta.className='fitpath-day-meta';
    meta.textContent=`${exerciseIds.length} exercise${exerciseIds.length===1?'':'s'}${exerciseIds.length?' · '+(session.sets||3)+' sets × '+(session.reps||'8–12')+' reps':''}`;
    card.append(meta);
    if(exerciseIds.length){
      const details=document.createElement('details');details.className='fitpath-exercise-details';
      const toggle=document.createElement('summary');toggle.textContent='View recommended exercises';
      const ul=document.createElement('ul');
      exerciseIds.forEach(id=>{
        const exercise=EXERCISES.find(e=>e.id===id);
        if(!exercise)return;
        const li=document.createElement('li');
        const name=document.createElement('strong');name.textContent=exercise.name;
        const prescription=document.createElement('span');prescription.textContent=`${session.sets||3} × ${session.reps||'8–12'}`;
        li.append(name,prescription);ul.append(li);
      });
      details.append(toggle,ul);card.append(details);
    }else{
      const p=document.createElement('p');p.textContent='No exercises yet. Ask Gemini to build your routine or add your own.';card.append(p);
    }
    const actions=document.createElement('div');actions.className='fitpath-day-actions';
    const edit=document.createElement('a');edit.className='small-button';
    edit.href='exercises.html?day='+encodeURIComponent(day);
    edit.textContent=exerciseIds.length?'Edit exercises →':'Add exercises →';
    const log=document.createElement('a');log.className='fitpath-text-link';
    log.href='tracker.html?day='+encodeURIComponent(day);log.textContent='Log workout';
    actions.append(edit,log);card.append(actions);
    const change=document.createElement('details');change.className='fitpath-focus-edit';
    const changeTitle=document.createElement('summary');changeTitle.textContent='Change workout focus';
    const label=document.createElement('label');label.textContent='Workout focus';label.htmlFor='focus-'+day;
    const sel=document.createElement('select');sel.id='focus-'+day;
    [...new Set([session.focus,...focuses].filter(Boolean))].forEach(f=>sel.add(new Option(f,f)));
    sel.value=session.focus||'Full Body';
    sel.addEventListener('change',()=>{
      plan.sessions[day]={...plan.sessions[day],focus:sel.value,aiGenerated:false};
      savePlan(plan);status.textContent=`${day} focus saved.`;
      render();
    });
    change.append(changeTitle,label,sel);card.append(change);
   }
   grid.append(card);
  });
 }
 render();
}
