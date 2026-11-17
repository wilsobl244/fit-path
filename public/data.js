const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const EXERCISES = [
  {id:"squat",name:"Goblet Squat",group:"Legs",equipment:"Dumbbell",level:"Beginner",instructions:"Hold a dumbbell at your chest. Bend hips and knees, then stand tall."},
  {id:"legpress",name:"Leg Press",group:"Legs",equipment:"Machine",level:"Beginner",instructions:"Keep your back supported, lower the platform with control, then press away."},
  {id:"lunge",name:"Reverse Lunge",group:"Legs",equipment:"Bodyweight",level:"Beginner",instructions:"Step backward, bend both knees comfortably, and return to standing."},
  {id:"bridge",name:"Glute Bridge",group:"Glutes",equipment:"Bodyweight",level:"Beginner",instructions:"Lie on your back with bent knees. Lift hips, pause, and lower slowly."},
  {id:"hipthrust",name:"Hip Thrust",group:"Glutes",equipment:"Bench",level:"Intermediate",instructions:"Support your upper back on a bench and lift hips with a controlled range."},
  {id:"row",name:"Seated Cable Row",group:"Back",equipment:"Cable",level:"Beginner",instructions:"Sit tall, pull handles toward your torso, and return with control."},
  {id:"pulldown",name:"Lat Pulldown",group:"Back",equipment:"Machine",level:"Beginner",instructions:"Pull the bar toward your upper chest without leaning far backward."},
  {id:"pushup",name:"Incline Push-Up",group:"Chest",equipment:"Bodyweight",level:"Beginner",instructions:"Place hands on a stable elevated surface. Lower chest and press back up."},
  {id:"chestpress",name:"Chest Press",group:"Chest",equipment:"Machine",level:"Beginner",instructions:"Press handles forward smoothly and return slowly."},
  {id:"shoulder",name:"Shoulder Press",group:"Shoulders",equipment:"Dumbbell",level:"Intermediate",instructions:"Press dumbbells overhead without arching your lower back."},
  {id:"curl",name:"Biceps Curl",group:"Arms",equipment:"Dumbbell",level:"Beginner",instructions:"Keep elbows close to your sides and curl with control."},
  {id:"triceps",name:"Triceps Pushdown",group:"Arms",equipment:"Cable",level:"Beginner",instructions:"Keep elbows near your torso and extend your arms downward."},
  {id:"plank",name:"Plank",group:"Core",equipment:"Bodyweight",level:"Beginner",instructions:"Keep your body in a straight line and breathe steadily."},
  {id:"deadbug",name:"Dead Bug",group:"Core",equipment:"Bodyweight",level:"Beginner",instructions:"Lie on your back and extend opposite arm and leg while keeping your trunk stable."}
];
function loadPlan(){try {return JSON.parse(localStorage.getItem('fitpathPlan'))}catch{return null}}
function savePlan(plan){localStorage.setItem('fitpathPlan',JSON.stringify(plan))}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function ensurePlan(){const p=loadPlan();if(!p||!Array.isArray(p.days)){location.href='setup.html';return null}p.exercises=p.exercises||{};p.sessions=p.sessions||{};return p}
