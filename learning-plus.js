(function(){
  const baseSave=window.save;
  const baseShowView=window.showView;
  const baseStartQuiz=window.startQuiz;
  const basePlayAnswerSound=window.playAnswerSound;
  const appViewStack=[document.querySelector('.view.active')?.id||'homeView'];
  let handlingAppPop=false,rootBackAt=0,rootBackTimer=0;
  try{const root=appViewStack[0];history.replaceState({...history.state,englishAdventureBack:true,englishAdventureView:root,englishAdventureRoot:true},'',location.href);history.pushState({englishAdventureBack:true,englishAdventureView:root,englishAdventureGuard:true},'',location.href)}catch(e){}
  function pushAppView(id){if(!id||!document.getElementById(id)?.classList.contains('view')||id===appViewStack[appViewStack.length-1])return;appViewStack.push(id);try{history.pushState({englishAdventureBack:true,englishAdventureView:id},'',location.href)}catch(e){}}
  window.addEventListener('popstate',event=>{const target=event.state?.englishAdventureView,current=appViewStack[appViewStack.length-1];if(target&&target!==current){const at=appViewStack.lastIndexOf(target);if(at>=0)appViewStack.splice(at+1);else appViewStack.push(target);handlingAppPop=true;baseShowView(target);handlingAppPop=false;lastTick=Date.now();renderDailyTimer();return}if(appViewStack.length>1){appViewStack.pop();const previous=appViewStack[appViewStack.length-1];handlingAppPop=true;baseShowView(previous);handlingAppPop=false;lastTick=Date.now();renderDailyTimer();return}const now=Date.now();if(rootBackAt&&now-rootBackAt<=2200){rootBackAt=0;clearTimeout(rootBackTimer);return}rootBackAt=now;toast('กดอีกครั้งเพื่อออกจากแอป');clearTimeout(rootBackTimer);rootBackTimer=setTimeout(()=>{rootBackAt=0},2200)});
  window.playAnswerSound=function(correct){if(basePlayAnswerSound)basePlayAnswerSound(correct);if(correct&&typeof window.showSuccessCelebration==='function')window.showSuccessCelebration()};
  const praiseLines=[
    'ดีใจด้วยค่ะ วันนี้น้อง{name} เรียนรู้ครบ {minutes} นาทีแล้ว เก่งและตั้งใจมากเลยค่ะ',
    'ยอดเยี่ยมไปเลยค่ะ น้อง{name} ฝึกภาษาอังกฤษครบ {minutes} นาทีแล้ว ทำได้สำเร็จอีกหนึ่งเป้าหมายค่ะ',
    'ว้าว วันนี้น้อง{name} เรียนรู้ครบ {minutes} นาทีแล้วค่ะ ครูภูมิใจในความพยายามนะคะ',
    'เก่งมากค่ะ น้อง{name} สะสมเวลาเรียนครบ {minutes} นาทีแล้ว พักสายตาและดื่มน้ำสักหน่อยนะคะ',
    'ภารกิจวันนี้สำเร็จแล้วค่ะ น้อง{name} ตั้งใจเรียนครบ {minutes} นาทีเลย เยี่ยมมากค่ะ',
    'ขอเสียงปรบมือให้น้อง{name} หน่อยค่ะ วันนี้เรียนครบ {minutes} นาทีแล้ว เก่งขึ้นอีกก้าวแล้วนะคะ',
    'น้อง{name} ทำได้แล้วค่ะ เรียนรู้ครบ {minutes} นาทีเต็ม ครูดีใจที่เห็นความตั้งใจนะคะ',
    'สุดยอดค่ะ น้อง{name} เก็บดาวความพยายามครบ {minutes} นาทีแล้ว วันนี้ภูมิใจในตัวเองได้เลยค่ะ'
  ];
  let activity=null;
  let talkSession=null;
  let talkRecognition=null;
  const TALK_BANK={
    1:{
      1:[
        {topic:'แนะนำตัว',en:'What is your name?',answer:'My name is {name}.',rule:'name',hint:'เริ่มด้วย “My name is …”'},
        {topic:'ชื่อคุณครู',en:'What is your teacher’s name?',answer:'My teacher’s name is Ms. Anna.',rule:'teacher',hint:'เริ่มด้วย “My teacher’s name is …” ใช้ชื่อสมมติได้'},
        {topic:'ชื่อคุณแม่',en:'What is your mother’s name?',answer:'My mother’s name is Mrs. Mali.',rule:'mother',hint:'เริ่มด้วย “My mother’s name is …” ใช้ชื่อสมมติได้'},
        {topic:'ความรู้สึก',en:'How are you today?',answer:'I am fine, thank you.',rule:'exact',accept:['i am fine thank you','im fine thank you','i am good thank you','im good thank you','fine thank you'],hint:'ลองพูด “I am fine, thank you.”'},
        {topic:'ขอความช่วยเหลือ',en:'What do you say when you need help?',answer:'Please help me.',rule:'exact',accept:['please help me','can you help me please'],hint:'จำคำว่า “Please help me.”'}
      ],
      2:[
        {topic:'สิ่งที่ชอบ',en:'What color do you like?',answer:'I like blue.',rule:'prefix',prefix:['i like'],hint:'เริ่มด้วย “I like …”'},
        {topic:'กิจวัตรตอนเช้า',en:'What do you do in the morning?',answer:'I brush my teeth.',rule:'prefix',prefix:['i brush','i wash','i eat','i get up','i wake up','i have'],hint:'ตอบเป็นกิจกรรม เช่น “I brush my teeth.”'},
        {topic:'ขอให้พูดซ้ำ',en:'What can you say if you do not understand?',answer:'Could you say that again, please?',rule:'exact',accept:['could you say that again please','can you say that again please','please repeat'],hint:'ลองพูด “Could you say that again, please?”'},
        {topic:'ชวนเพื่อนเล่น',en:'How do you invite a friend to play?',answer:'Would you like to play with me?',rule:'exact',accept:['would you like to play with me','do you want to play with me'],hint:'เริ่มด้วย “Would you like to …?”'},
        {topic:'กล่าวลา',en:'What do you say when you leave?',answer:'Goodbye. See you tomorrow.',rule:'exact',accept:['goodbye see you tomorrow','goodbye see you','see you tomorrow'],hint:'พูด “Goodbye” แล้วบอกว่าจะพบกันใหม่'}
      ]
    },
    2:{
      1:[
        {topic:'แนะนำตัว',en:'Can you introduce yourself?',answer:'My name is {name}. I am in Grade {grade}.',rule:'name',hint:'บอกชื่อก่อน แล้วบอกชั้นเรียน'},
        {topic:'ชื่อคุณครู',en:'What is your teacher’s name?',answer:'My teacher’s name is Ms. Anna.',rule:'teacher',hint:'เริ่มด้วย “My teacher’s name is …” ใช้ชื่อสมมติได้'},
        {topic:'โรงเรียน',en:'What is your school like?',answer:'My school is friendly.',rule:'school',hint:'เริ่มด้วย “My school is …”'},
        {topic:'งานอดิเรก',en:'What do you like to do after school?',answer:'I like drawing after school.',rule:'afterSchool',hint:'เริ่มด้วย “I like … after school.”'},
        {topic:'ขอความช่วยเหลือ',en:'How do you politely ask for help?',answer:'Could you help me, please?',rule:'help',hint:'ใช้คำว่า “Could you help me, please?”'}
      ],
      2:[
        {topic:'กิจวัตร',en:'What do you do before school?',answer:'First, I get ready. Then, I go to school.',rule:'sequence',hint:'ใช้ “First … Then …” เล่าอย่างน้อยสองขั้นตอน'},
        {topic:'ถามทางในโรงเรียน',en:'How can you ask for directions to the library?',answer:'Could you show me the way to the library?',rule:'directionAsk',hint:'เริ่มด้วย “Could you show me the way to …?”'},
        {topic:'สั่งอาหารว่าง',en:'What would you like to eat?',answer:'I would like a sandwich, please.',rule:'order',hint:'เริ่มด้วย “I would like …, please.”'},
        {topic:'ชวนเพื่อน',en:'How do you invite a friend to join you?',answer:'Would you like to play with us?',rule:'invite',hint:'เริ่มด้วย “Would you like to …?”'},
        {topic:'ขอให้พูดซ้ำ',en:'What can you say if you did not hear clearly?',answer:'Could you repeat that, please?',rule:'repeat',hint:'ใช้คำว่า “Could you repeat that, please?”'}
      ]
    },
    3:{
      1:[
        {topic:'แนะนำตัว',en:'Please introduce yourself.',answer:'My name is {name}. I am in Grade {grade}.',rule:'name',hint:'บอกชื่อและชั้นเรียนเป็นภาษาอังกฤษ'},
        {topic:'วิชาที่ชอบ',en:'What is your favorite subject?',answer:'My favorite subject is English.',rule:'favorite',hint:'เริ่มด้วย “My favorite subject is …”'},
        {topic:'บอกเหตุผล',en:'Why do you like English?',answer:'I like English because it is fun.',rule:'because',hint:'ลองใช้ “because” เพื่อบอกเหตุผล'},
        {topic:'เวลาว่าง',en:'What do you enjoy doing in your free time?',answer:'I enjoy drawing in my free time.',rule:'enjoy',hint:'เริ่มด้วย “I enjoy …”'},
        {topic:'ขอให้พูดช้าลง',en:'How can you ask someone to speak more slowly?',answer:'Could you speak more slowly, please?',rule:'slow',hint:'ใช้ “Could you speak more slowly, please?”'}
      ],
      2:[
        {topic:'กิจวัตรประจำวัน',en:'Tell me about your morning routine.',answer:'First, I get ready. Then, I go to school.',rule:'sequence',hint:'เล่าเป็นสองขั้นตอนโดยใช้ “First” และ “Then”'},
        {topic:'กิจกรรมหลังเลิกเรียน',en:'What do you do after school?',answer:'After school, I do my homework and play.',rule:'afterSchool',hint:'เริ่มด้วย “After school, I …” แล้วบอกสองกิจกรรม'},
        {topic:'ถามทาง',en:'How do you ask for the way to the library?',answer:'Could you show me the way to the library?',rule:'directionAsk',hint:'ถามอย่างสุภาพโดยใช้ “Could you show me …?”'},
        {topic:'สั่งอาหาร',en:'What would you like to order?',answer:'I would like a sandwich and some water, please.',rule:'order',hint:'เริ่มด้วย “I would like …, please.”'},
        {topic:'ขอคำอธิบาย',en:'What can you say when you need more information?',answer:'Could you explain that again, please?',rule:'repeat',hint:'ขอให้อธิบายซ้ำอย่างสุภาพ'}
      ]
    }
  };
  const TALK_MEANINGS={
    1:{
      1:[
        'ครูจะถามว่าน้องชื่ออะไร ให้น้องตอบชื่อของน้องเป็นภาษาอังกฤษนะคะ',
        'ครูจะถามว่าคุณครูชื่ออะไร ให้น้องตอบเป็นภาษาอังกฤษ โดยใช้ชื่อสมมติได้นะคะ',
        'ครูจะถามว่าคุณแม่ชื่ออะไร ให้น้องตอบเป็นภาษาอังกฤษ โดยใช้ชื่อสมมติได้นะคะ',
        'ครูจะถามว่าวันนี้น้องรู้สึกอย่างไร ให้น้องตอบความรู้สึกของตัวเองเป็นภาษาอังกฤษนะคะ',
        'ครูจะถามว่าเมื่อต้องการความช่วยเหลือ น้องควรพูดว่าอย่างไร ให้น้องตอบเป็นภาษาอังกฤษนะคะ'
      ],
      2:[
        'ครูจะถามว่าน้องชอบสีอะไร ให้น้องตอบชื่อสีนั้นเป็นภาษาอังกฤษนะคะ',
        'ครูจะถามว่าตอนเช้าน้องทำอะไร ให้น้องตอบกิจกรรมที่ทำเป็นภาษาอังกฤษนะคะ',
        'ครูจะถามว่าถ้าน้องไม่เข้าใจ น้องจะขอให้พูดซ้ำเป็นภาษาอังกฤษว่าอย่างไรนะคะ',
        'ครูจะถามว่าน้องจะชวนเพื่อนเล่นอย่างไร ให้น้องตอบเป็นภาษาอังกฤษนะคะ',
        'ครูจะถามว่าเมื่อน้องกำลังจะกลับ น้องจะพูดลาเป็นภาษาอังกฤษว่าอย่างไรนะคะ'
      ]
    },
    2:{
      1:[
        'ครูจะชวนให้น้องแนะนำตัวเองเป็นภาษาอังกฤษ โดยบอกชื่อและชั้นเรียนค่ะ',
        'ครูจะถามว่าคุณครูชื่ออะไร ให้น้องตอบเป็นภาษาอังกฤษ โดยใช้ชื่อสมมติได้นะคะ',
        'ครูจะถามว่าโรงเรียนของน้องมีลักษณะอย่างไร ให้น้องบอกเป็นภาษาอังกฤษ โดยไม่ต้องบอกชื่อโรงเรียนนะคะ',
        'ครูจะถามว่าหลังเลิกเรียนน้องชอบทำอะไร ให้น้องตอบเป็นภาษาอังกฤษนะคะ',
        'ครูจะถามว่าน้องจะขอความช่วยเหลืออย่างสุภาพเป็นภาษาอังกฤษได้อย่างไรนะคะ'
      ],
      2:[
        'ครูจะถามว่าก่อนมาโรงเรียนน้องทำอะไรบ้าง ให้น้องเล่าเป็นภาษาอังกฤษอย่างน้อยสองขั้นตอนค่ะ',
        'ครูจะถามว่าน้องจะถามทางไปห้องสมุดเป็นภาษาอังกฤษอย่างไรนะคะ',
        'ครูจะถามว่าน้องอยากกินอะไร ให้น้องตอบเป็นภาษาอังกฤษค่ะ',
        'ครูจะถามว่าน้องจะชวนเพื่อนมาร่วมกิจกรรมอย่างไร ให้น้องตอบเป็นภาษาอังกฤษนะคะ',
        'ครูจะถามว่าถ้าน้องฟังไม่ชัด น้องจะขอให้พูดซ้ำเป็นภาษาอังกฤษอย่างไรนะคะ'
      ]
    },
    3:{
      1:[
        'ครูจะชวนให้น้องแนะนำตัวเองเป็นภาษาอังกฤษ โดยบอกชื่อและชั้นเรียนค่ะ',
        'ครูจะถามว่าวิชาใดเป็นวิชาที่น้องชอบที่สุด ให้น้องตอบเป็นภาษาอังกฤษนะคะ',
        'ครูจะถามว่าทำไมน้องถึงชอบภาษาอังกฤษ ให้น้องตอบเหตุผลเป็นภาษาอังกฤษค่ะ',
        'ครูจะถามว่าเวลาว่างน้องชอบทำอะไร ให้น้องตอบเป็นภาษาอังกฤษนะคะ',
        'ครูจะถามว่าน้องจะขอให้ใครสักคนพูดช้าลงเป็นภาษาอังกฤษได้อย่างไรนะคะ'
      ],
      2:[
        'ครูจะชวนให้น้องเล่ากิจวัตรตอนเช้าเป็นภาษาอังกฤษ โดยเรียงอย่างน้อยสองขั้นตอนค่ะ',
        'ครูจะถามว่าหลังเลิกเรียนน้องทำอะไร ให้น้องตอบเป็นภาษาอังกฤษอย่างน้อยสองกิจกรรมค่ะ',
        'ครูจะถามว่าน้องจะถามทางไปห้องสมุดเป็นภาษาอังกฤษอย่างไรนะคะ',
        'ครูจะถามว่าน้องต้องการสั่งอาหารอะไร ให้น้องตอบเป็นภาษาอังกฤษค่ะ',
        'ครูจะถามว่าเมื่อต้องการข้อมูลเพิ่มเติม น้องจะขอให้อธิบายอีกครั้งเป็นภาษาอังกฤษอย่างไรนะคะ'
      ]
    }
  };
  const P2_V1_TALK_BANK={
    hello:[
      {topic:'แนะนำตัว',en:'What is your name?',answer:'My name is {name}.',rule:'name',meaning:'ครูจะถามว่าน้องชื่ออะไร ให้น้องตอบชื่อของน้องเป็นภาษาอังกฤษนะคะ',hint:'ลองตอบชื่อของตัวเองเป็นภาษาอังกฤษ'},
      {topic:'ความรู้สึก',en:'How are you today?',answer:'I am happy.',rule:'exact',accept:['i am happy','i am fine','im happy','im fine'],meaning:'ครูจะถามว่าวันนี้น้องรู้สึกอย่างไร ให้น้องตอบความรู้สึกของตัวเองเป็นภาษาอังกฤษค่ะ',hint:'ลองบอกความรู้สึกของตัวเองเป็นภาษาอังกฤษ'},
      {topic:'ทักทายเพื่อน',en:'What do you say when you meet a friend?',answer:'Hello, friend!',rule:'exact',accept:['hello friend','hi friend','hello mali','hi mali'],meaning:'ครูจะถามว่าเมื่อน้องพบเพื่อน น้องจะกล่าวทักทายเป็นภาษาอังกฤษว่าอย่างไรนะคะ',hint:'ลองนึกถึงคำทักทายภาษาอังกฤษ'},
      {topic:'กล่าวลา',en:'What do you say when you leave?',answer:'Goodbye, friend!',rule:'exact',accept:['goodbye friend','goodbye mali','bye friend','bye mali'],meaning:'ครูจะถามว่าเมื่อน้องกำลังจะกลับ น้องจะกล่าวลาเป็นภาษาอังกฤษว่าอย่างไรนะคะ',hint:'ลองนึกถึงคำกล่าวลาเป็นภาษาอังกฤษ'},
      {topic:'ขอบคุณ',en:'How do you thank your teacher?',answer:'Thank you, teacher.',rule:'exact',accept:['thank you teacher','thanks teacher'],meaning:'ครูจะถามว่าน้องจะกล่าวขอบคุณคุณครูเป็นภาษาอังกฤษว่าอย่างไรนะคะ',hint:'ลองนึกถึงคำที่ใช้กล่าวขอบคุณ'}
    ],
    school:[
      {topic:'สิ่งของในห้องเรียน',en:'What do you read?',answer:'I read a book.',rule:'prefix',prefix:['i read'],meaning:'ครูจะถามว่าน้องอ่านอะไร ให้น้องตอบชื่อสิ่งที่อ่านเป็นภาษาอังกฤษค่ะ',hint:'ลองนึกถึงสิ่งของที่ใช้อ่าน'},
      {topic:'อุปกรณ์การเรียน',en:'What do you write with?',answer:'I write with a pencil.',rule:'prefix',prefix:['i write with'],meaning:'ครูจะถามว่าน้องใช้สิ่งใดเขียน ให้น้องตอบชื่ออุปกรณ์เป็นภาษาอังกฤษค่ะ',hint:'ลองนึกถึงอุปกรณ์ที่ใช้เขียน'},
      {topic:'สีของกระเป๋า',en:'What color is your bag?',answer:'My bag is blue.',rule:'prefix',prefix:['my bag is'],meaning:'ครูจะถามว่ากระเป๋าของน้องสีอะไร ให้น้องตอบสีเป็นภาษาอังกฤษค่ะ',hint:'ลองบอกสีของกระเป๋าเป็นภาษาอังกฤษ'},
      {topic:'ตำแหน่งสิ่งของ',en:'Where is the book?',answer:'The book is on the desk.',rule:'exact',accept:['the book is on the desk','it is on the desk','on the desk'],meaning:'ครูจะถามว่าหนังสืออยู่ที่ไหน ให้น้องตอบตำแหน่งเป็นภาษาอังกฤษค่ะ',hint:'ลองบอกตำแหน่งของหนังสือเป็นภาษาอังกฤษ'},
      {topic:'คำสั่งในห้องเรียน',en:'What can you say when you want someone to open a book?',answer:'Open your book, please.',rule:'exact',accept:['open your book please','please open your book'],meaning:'ครูจะถามว่าน้องจะขอให้ใครสักคนเปิดหนังสืออย่างสุภาพได้อย่างไร ให้น้องตอบเป็นภาษาอังกฤษค่ะ',hint:'ลองพูดคำขออย่างสุภาพเป็นภาษาอังกฤษ'}
    ],
    colors:[
      {topic:'สีของแอปเปิล',en:'What color is the apple?',answer:'The apple is red.',rule:'exact',accept:['the apple is red','it is red','red'],meaning:'ครูจะถามว่าแอปเปิลมีสีอะไร ให้น้องตอบชื่อสีเป็นภาษาอังกฤษค่ะ',hint:'ลองนึกถึงสีของแอปเปิลในบทเรียน'},
      {topic:'สีของท้องฟ้า',en:'What color is the sky?',answer:'The sky is blue.',rule:'exact',accept:['the sky is blue','it is blue','blue'],meaning:'ครูจะถามว่าท้องฟ้ามีสีอะไร ให้น้องตอบชื่อสีเป็นภาษาอังกฤษค่ะ',hint:'ลองนึกถึงสีของท้องฟ้าในบทเรียน'},
      {topic:'สีของใบไม้',en:'What color is the leaf?',answer:'The leaf is green.',rule:'exact',accept:['the leaf is green','it is green','green'],meaning:'ครูจะถามว่าใบไม้มีสีอะไร ให้น้องตอบชื่อสีเป็นภาษาอังกฤษค่ะ',hint:'ลองนึกถึงสีของใบไม้ในบทเรียน'},
      {topic:'รูปทรงกลม',en:'What shape is round?',answer:'A circle is round.',rule:'exact',accept:['a circle is round','circle','it is a circle'],meaning:'ครูจะถามว่ารูปทรงใดมีลักษณะกลม ให้น้องตอบชื่อรูปทรงเป็นภาษาอังกฤษค่ะ',hint:'ลองนึกถึงรูปทรงที่กลม'},
      {topic:'รูปทรงสี่เหลี่ยม',en:'What shape has four equal sides?',answer:'It is a square.',rule:'exact',accept:['it is a square','a square','square'],meaning:'ครูจะถามว่ารูปทรงใดมีด้านเท่ากันสี่ด้าน ให้น้องตอบชื่อรูปทรงเป็นภาษาอังกฤษค่ะ',hint:'ลองนึกถึงรูปทรงที่มีด้านเท่ากันสี่ด้าน'}
    ],
    family:[
      {topic:'คำศัพท์สมาชิกครอบครัว',en:'What is the English word for “แม่”?',answer:'Mother.',rule:'exact',accept:['mother','mom','mum'],meaning:'ครูจะถามว่าคำภาษาอังกฤษของ “แม่” คือคำใด ให้น้องตอบเป็นคำศัพท์ภาษาอังกฤษค่ะ',hint:'ลองนึกถึงคำศัพท์สมาชิกครอบครัว'},
      {topic:'คำศัพท์สมาชิกครอบครัว',en:'What is the English word for “พ่อ”?',answer:'Father.',rule:'exact',accept:['father','dad','daddy'],meaning:'ครูจะถามว่าคำภาษาอังกฤษของ “พ่อ” คือคำใด ให้น้องตอบเป็นคำศัพท์ภาษาอังกฤษค่ะ',hint:'ลองนึกถึงคำศัพท์สมาชิกครอบครัว'},
      {topic:'พี่สาวหรือน้องสาว',en:'Which word means a female sibling?',answer:'Sister.',rule:'exact',accept:['sister'],meaning:'ครูจะถามว่าคำศัพท์ภาษาอังกฤษคำใดหมายถึงพี่สาวหรือน้องสาว ให้น้องตอบเป็นคำศัพท์ภาษาอังกฤษค่ะ',hint:'ลองนึกถึงคำศัพท์พี่น้องผู้หญิง'},
      {topic:'พี่ชายหรือน้องชาย',en:'Which word means a male sibling?',answer:'Brother.',rule:'exact',accept:['brother'],meaning:'ครูจะถามว่าคำศัพท์ภาษาอังกฤษคำใดหมายถึงพี่ชายหรือน้องชาย ให้น้องตอบเป็นคำศัพท์ภาษาอังกฤษค่ะ',hint:'ลองนึกถึงคำศัพท์พี่น้องผู้ชาย'},
      {topic:'ครอบครัว',en:'What can you say about your family?',answer:'I love my family.',rule:'exact',accept:['i love my family','my family is kind'],meaning:'ครูจะถามว่าน้องจะพูดอะไรเกี่ยวกับครอบครัว ให้น้องตอบเป็นภาษาอังกฤษโดยไม่ต้องบอกชื่อจริงของใครค่ะ',hint:'ลองนึกถึงประโยคภาษาอังกฤษเกี่ยวกับครอบครัว'}
    ],
    animals:[
      {topic:'สัตว์ที่กระโดดได้',en:'Which animal can jump?',answer:'A cat can jump.',rule:'exact',accept:['a cat can jump','the cat can jump','cat can jump'],meaning:'ครูจะถามว่าสัตว์ชนิดใดกระโดดได้ ให้น้องตอบชื่อสัตว์เป็นภาษาอังกฤษค่ะ',hint:'ลองนึกถึงสัตว์ที่กระโดดได้'},
      {topic:'สัตว์ที่บินได้',en:'Which animal can fly?',answer:'A bird can fly.',rule:'exact',accept:['a bird can fly','the bird can fly','bird can fly'],meaning:'ครูจะถามว่าสัตว์ชนิดใดบินได้ ให้น้องตอบชื่อสัตว์เป็นภาษาอังกฤษค่ะ',hint:'ลองนึกถึงสัตว์ที่บินได้'},
      {topic:'สัตว์ที่ว่ายน้ำได้',en:'Which animal can swim?',answer:'A fish can swim.',rule:'exact',accept:['a fish can swim','the fish can swim','fish can swim'],meaning:'ครูจะถามว่าสัตว์ชนิดใดว่ายน้ำได้ ให้น้องตอบชื่อสัตว์เป็นภาษาอังกฤษค่ะ',hint:'ลองนึกถึงสัตว์ที่ว่ายน้ำได้'},
      {topic:'สัตว์ตัวใหญ่',en:'Which animal is big?',answer:'An elephant is big.',rule:'exact',accept:['an elephant is big','the elephant is big','elephant'],meaning:'ครูจะถามว่าสัตว์ชนิดใดมีตัวใหญ่ ให้น้องตอบชื่อสัตว์เป็นภาษาอังกฤษค่ะ',hint:'ลองนึกถึงสัตว์ตัวใหญ่'},
      {topic:'สัตว์ที่วิ่งได้',en:'Which animal can run?',answer:'A rabbit can run.',rule:'exact',accept:['a rabbit can run','the rabbit can run','rabbit can run'],meaning:'ครูจะถามว่าสัตว์ชนิดใดวิ่งได้ ให้น้องตอบชื่อสัตว์เป็นภาษาอังกฤษค่ะ',hint:'ลองนึกถึงสัตว์ที่วิ่งได้'}
    ],
    food:[
      {topic:'อาหาร',en:'What do you eat?',answer:'I eat rice.',rule:'prefix',prefix:['i eat'],meaning:'ครูจะถามว่าน้องกินอะไร ให้น้องตอบชื่ออาหารเป็นภาษาอังกฤษค่ะ',hint:'ลองนึกถึงคำศัพท์อาหารในบทเรียน'},
      {topic:'เครื่องดื่ม',en:'What do you drink?',answer:'I drink milk.',rule:'prefix',prefix:['i drink'],meaning:'ครูจะถามว่าน้องดื่มอะไร ให้น้องตอบชื่อเครื่องดื่มเป็นภาษาอังกฤษค่ะ',hint:'ลองนึกถึงคำศัพท์เครื่องดื่มในบทเรียน'},
      {topic:'ผลไม้ที่ชอบ',en:'Which fruit do you like?',answer:'I like bananas.',rule:'prefix',prefix:['i like'],meaning:'ครูจะถามว่าน้องชอบผลไม้ชนิดใด ให้น้องตอบเป็นภาษาอังกฤษค่ะ',hint:'ลองบอกผลไม้ที่ชอบเป็นภาษาอังกฤษ'},
      {topic:'สีของกล้วย',en:'What color is the banana?',answer:'The banana is yellow.',rule:'exact',accept:['the banana is yellow','it is yellow','yellow'],meaning:'ครูจะถามว่ากล้วยมีสีอะไร ให้น้องตอบชื่อสีเป็นภาษาอังกฤษค่ะ',hint:'ลองนึกถึงสีของกล้วยในบทเรียน'},
      {topic:'การดื่มน้ำ',en:'What should you drink?',answer:'Please drink water.',rule:'exact',accept:['please drink water','drink water please','water'],meaning:'ครูจะถามว่าน้องควรดื่มอะไร ให้น้องตอบชื่อเครื่องดื่มเป็นภาษาอังกฤษค่ะ',hint:'ลองนึกถึงเครื่องดื่มที่ร่างกายต้องการ'}
    ],
    body:[
      {topic:'อวัยวะ',en:'What should you touch?',answer:'Touch your head.',rule:'exact',accept:['touch your head','my head'],meaning:'ครูจะถามว่าน้องควรแตะอวัยวะส่วนใด ให้น้องตอบเป็นภาษาอังกฤษค่ะ',hint:'ลองนึกถึงคำศัพท์อวัยวะในบทเรียน'},
      {topic:'จำนวนดวงตา',en:'How many eyes do you have?',answer:'I have two eyes.',rule:'exact',accept:['i have two eyes','two eyes'],meaning:'ครูจะถามว่าน้องมีดวงตากี่ข้าง ให้น้องตอบจำนวนเป็นภาษาอังกฤษค่ะ',hint:'ลองนึกถึงจำนวนดวงตาของคน'},
      {topic:'การปรบมือ',en:'What should you clap?',answer:'Clap your hands.',rule:'exact',accept:['clap your hands','my hands'],meaning:'ครูจะถามว่าน้องควรปรบอวัยวะส่วนใด ให้น้องตอบเป็นภาษาอังกฤษค่ะ',hint:'ลองนึกถึงอวัยวะที่ใช้ปรบ'},
      {topic:'การกระทืบเท้า',en:'What should you stamp?',answer:'Stamp your feet.',rule:'exact',accept:['stamp your feet','my feet'],meaning:'ครูจะถามว่าน้องควรกระทืบอวัยวะส่วนใด ให้น้องตอบเป็นภาษาอังกฤษค่ะ',hint:'ลองนึกถึงอวัยวะที่ใช้เดิน'},
      {topic:'การเคลื่อนไหว',en:'What can you do?',answer:'I can jump high.',rule:'prefix',prefix:['i can'],meaning:'ครูจะถามว่าน้องทำอะไรได้ ให้น้องตอบความสามารถของน้องเป็นภาษาอังกฤษค่ะ',hint:'ลองนึกถึงคำกริยาที่เรียนในบทนี้'}
    ],
    weather:[
      {topic:'สภาพอากาศ',en:'Which word describes weather with rain?',answer:'Rainy.',rule:'exact',accept:['rainy'],meaning:'ครูจะถามว่าคำภาษาอังกฤษคำใดใช้บอกสภาพอากาศที่มีฝน ให้น้องตอบเป็นคำศัพท์ภาษาอังกฤษค่ะ',hint:'ลองนึกถึงคำศัพท์อากาศที่เกี่ยวกับฝน'},
      {topic:'สภาพอากาศ',en:'Which word describes a day with strong sunshine?',answer:'Sunny.',rule:'exact',accept:['sunny'],meaning:'ครูจะถามว่าคำภาษาอังกฤษคำใดใช้บอกวันที่มีแดด ให้น้องตอบเป็นคำศัพท์ภาษาอังกฤษค่ะ',hint:'ลองนึกถึงคำศัพท์อากาศที่มีแสงแดด'},
      {topic:'อากาศร้อน',en:'What do you say when the weather is hot?',answer:'It is hot.',rule:'exact',accept:['it is hot','its hot','hot'],meaning:'ครูจะถามว่าน้องจะพูดอย่างไรเมื่ออากาศร้อน ให้น้องตอบเป็นภาษาอังกฤษค่ะ',hint:'ลองนึกถึงคำศัพท์บอกอากาศร้อน'},
      {topic:'อากาศหนาว',en:'What is the opposite of hot?',answer:'Cold.',rule:'exact',accept:['cold'],meaning:'ครูจะถามว่าคำใดมีความหมายตรงข้ามกับอากาศร้อน ให้น้องตอบเป็นคำศัพท์ภาษาอังกฤษค่ะ',hint:'ลองนึกถึงคำศัพท์อากาศที่ตรงข้ามกับร้อน'},
      {topic:'วันในสัปดาห์',en:'Which day comes after Sunday?',answer:'Monday.',rule:'exact',accept:['monday'],meaning:'ครูจะถามว่าวันใดต่อจากวันอาทิตย์ ให้น้องตอบชื่อวันเป็นภาษาอังกฤษค่ะ',hint:'ลองนึกถึงชื่อวันภาษาอังกฤษ'}
    ],
    home:[
      {topic:'ตำแหน่งสิ่งของในบ้าน',en:'Where is the teddy?',answer:'The teddy is on the bed.',rule:'exact',accept:['the teddy is on the bed','it is on the bed','on the bed'],meaning:'ครูจะถามว่าตุ๊กตาอยู่ที่ไหน ให้น้องตอบตำแหน่งเป็นภาษาอังกฤษค่ะ',hint:'ลองนึกถึงตำแหน่งของตุ๊กตาในประโยค'},
      {topic:'คำสั่งในบ้าน',en:'What can you say when you want someone to close the door?',answer:'Close the door, please.',rule:'exact',accept:['close the door please','please close the door'],meaning:'ครูจะถามว่าน้องจะขอให้ใครปิดประตูอย่างสุภาพได้อย่างไร ให้น้องตอบเป็นภาษาอังกฤษค่ะ',hint:'ลองพูดคำขออย่างสุภาพเป็นภาษาอังกฤษ'},
      {topic:'ตำแหน่งแก้ว',en:'Where is the cup?',answer:'The cup is on the table.',rule:'exact',accept:['the cup is on the table','it is on the table','on the table'],meaning:'ครูจะถามว่าแก้วอยู่ที่ไหน ให้น้องตอบตำแหน่งเป็นภาษาอังกฤษค่ะ',hint:'ลองนึกถึงตำแหน่งของแก้วในประโยค'},
      {topic:'สิ่งของในบ้าน',en:'Where can you sit?',answer:'I can sit on the chair.',rule:'exact',accept:['i can sit on the chair','sit on the chair','on the chair'],meaning:'ครูจะถามว่าน้องสามารถนั่งที่ไหน ให้น้องตอบชื่อสิ่งของหรือตำแหน่งเป็นภาษาอังกฤษค่ะ',hint:'ลองนึกถึงสิ่งของที่ใช้นั่ง'},
      {topic:'ตำแหน่งลูกบอล',en:'Where is the ball?',answer:'The ball is in the box.',rule:'exact',accept:['the ball is in the box','it is in the box','in the box'],meaning:'ครูจะถามว่าลูกบอลอยู่ที่ไหน ให้น้องตอบตำแหน่งเป็นภาษาอังกฤษค่ะ',hint:'ลองนึกถึงตำแหน่งของลูกบอลในประโยค'}
    ],
    actions:[
      {topic:'คำสั่ง',en:'What can you say when you want someone to stand?',answer:'Stand up, please.',rule:'exact',accept:['stand up please','please stand up'],meaning:'ครูจะถามว่าน้องจะบอกให้ใครยืนขึ้นอย่างสุภาพได้อย่างไร ให้น้องตอบเป็นภาษาอังกฤษค่ะ',hint:'ลองนึกถึงคำสั่งให้ยืนขึ้น'},
      {topic:'คำสั่ง',en:'What can you say when you want someone to sit?',answer:'Sit down, please.',rule:'exact',accept:['sit down please','please sit down'],meaning:'ครูจะถามว่าน้องจะบอกให้ใครนั่งลงอย่างสุภาพได้อย่างไร ให้น้องตอบเป็นภาษาอังกฤษค่ะ',hint:'ลองนึกถึงคำสั่งให้นั่งลง'},
      {topic:'การฟัง',en:'What should you do when someone tells a story?',answer:'Listen to the story.',rule:'exact',accept:['listen to the story','listen'],meaning:'ครูจะถามว่าเมื่อน้องฟังเรื่องเล่า น้องควรทำอะไร ให้น้องตอบเป็นภาษาอังกฤษค่ะ',hint:'ลองนึกถึงคำกริยาที่ใช้กับการฟัง'},
      {topic:'การมองดู',en:'What can you say when you want someone to see a picture?',answer:'Look at the picture.',rule:'exact',accept:['look at the picture','look'],meaning:'ครูจะถามว่าน้องจะชวนให้ใครดูรูปภาพอย่างไร ให้น้องตอบเป็นภาษาอังกฤษค่ะ',hint:'ลองนึกถึงคำกริยาที่ใช้กับการมอง'},
      {topic:'การเล่น',en:'How can you invite a friend to play?',answer:'Let’s play together.',rule:'exact',accept:['lets play together','let us play together','play together'],meaning:'ครูจะถามว่าน้องจะชวนเพื่อนมาเล่นด้วยกันอย่างไร ให้น้องตอบเป็นภาษาอังกฤษค่ะ',hint:'ลองนึกถึงประโยคชวนเล่นที่เรียนในบทนี้'}
    ]
  };
  function talkAvailable(){return !!activeUnit&&Array.isArray(activeUnit.items)&&activeUnit.items.length>0}
  function isDailyLifeUnit(){return !!activeUnit&&activeUnit.id.startsWith('daily-life-p')}
  function buildLessonTalk(unit){
    return unit.items.slice(0,5).map((item,i)=>{
      const word=String(item[0]||'').trim(),meaning=String(item[1]||word).trim(),sample=String(item[3]||'').trim();
      const sampleUsesWord=sample&&!sample.trim().endsWith('?')&&normalizeTalk(sample).includes(normalizeTalk(word));
      return{topic:meaning,en:`Can you make a sentence with the word “${word}”?`,answer:sampleUsesWord?sample:`I learned about ${word} today.`,rule:'lessonWordUse',target:word,meaning:`ครูจะถามให้น้องแต่งประโยคภาษาอังกฤษสั้น ๆ ที่ใช้คำว่า “${meaning}” จากบทนี้ค่ะ`,hint:`ลองใช้คำศัพท์ “${meaning}” ที่เรียนในบทนี้แต่งประโยคภาษาอังกฤษนะคะ`};
    });
  }
  let lastTick=Date.now();
  let saveTicks=0;
  let eyeRestSeconds=0;
  let celebrationTimer=0;
  const EYE_BREAK_SECONDS=1200;

  function dayKey(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
  function studentLabel(){const n=String(child().name||'').trim().replace(/^น้อง\s*/,'');return !n||n==='นักเรียนคนเก่ง'||n==='นักเรียนคนใหม่'?'คนเก่ง':n}
  function shuffle(a){const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x}
  function ensureData(){
    state.profiles.forEach(p=>{
      p.studySecondsByDay=p.studySecondsByDay||{};
      p.dailyPraiseQueue=Array.isArray(p.dailyPraiseQueue)?p.dailyPraiseQueue:[];
      p.courseData=p.courseData||{};
      Object.values(p.courseData).forEach(c=>{c.versions=c.versions||{};Object.values(c.versions).forEach(v=>{v.activityDone=v.activityDone||{}})});
      if(p.eyeBreakFocusDay!==dayKey()){p.eyeBreakFocusDay=dayKey();p.eyeBreakFocusSeconds=0}else p.eyeBreakFocusSeconds=Number(p.eyeBreakFocusSeconds)||0;
    });
    const v=versionData();v.activityDone=v.activityDone||{};
  }
  function secondsToday(p=child()){p.studySecondsByDay=p.studySecondsByDay||{};return p.studySecondsByDay[dayKey()]||0}
  function goalSeconds(p=child()){const m=Number.parseInt(p.dailyGoalMinutes??60,10);return Math.max(1,Math.min(720,Number.isFinite(m)?m:60))*60}
  function formatTime(s){const m=Math.floor(s/60),r=s%60;return `${m}:${String(r).padStart(2,'0')}`}
  function persist(){state.activeId=selectedId;localStorage.setItem(KEY,JSON.stringify(state))}
  function renderDailyTimer(){
    const seconds=secondsToday(),target=goalSeconds(),minutes=target/60,label=document.getElementById('studyTimeLabel'),bar=document.getElementById('studyTimeBar'),note=document.getElementById('studyTimeNote');
    if(label)label.textContent=`${formatTime(Math.min(seconds,target))} / ${formatTime(target)} นาที`;
    if(bar)bar.style.width=`${Math.min(100,seconds/target*100)}%`;
    if(note){if(eyeRestSeconds>0)note.textContent=`พักสายตาอีก ${eyeRestSeconds} วินาที แล้วค่อยเรียนต่อค่ะ`;else if(seconds>=target)note.textContent=`🎉 วันนี้ครบเป้าหมาย ${minutes} นาทีแล้ว เก่งมาก!`;else{const p=child();if(p.eyeBreakFocusDay!==dayKey()){p.eyeBreakFocusDay=dayKey();p.eyeBreakFocusSeconds=0}const due=Math.max(0,EYE_BREAK_SECONDS-(p.eyeBreakFocusSeconds||0));note.textContent=`เวลาจะนับตอนอยู่ในหน้าบทเรียนและกิจกรรม · พักสายตาใน ${formatTime(due)}`}}
  }
  function choosePraise(p){
    if(!p.dailyPraiseQueue.length)p.dailyPraiseQueue=shuffle(praiseLines.map((_,i)=>i));
    const i=p.dailyPraiseQueue.pop();
    return praiseLines[i].replace('{name}',studentLabel()).replace('{minutes}',String(child().dailyGoalMinutes||60));
  }
  function maybeCelebrate(){
    const p=child(),today=dayKey();
    const minutes=Number(p.dailyGoalMinutes)||60;
    if(secondsToday(p)<goalSeconds(p)||p.dailyGoalSpokenDate===today)return;
    p.dailyGoalSpokenDate=today;
    const line=choosePraise(p);
    persist();
    if(typeof coach==='function'&&voiceEnabled)coach(line);else toast(`ครบ ${minutes} นาทีแล้วค่ะ น้อง${studentLabel()} เก่งมาก!`);
    renderDailyTimer();
  }
  function learningViewActive(){return document.visibilityState==='visible'&&(['lessonsView','studyView'].some(id=>document.getElementById(id)?.classList.contains('active')))}
  function ageBreakLine(){
    const grade=Number(child().grade),name=studentLabel();
    if(grade<=2)return `เก่งมากค่ะ น้อง${name} พักสายตากันนะคะ มองไปไกล ๆ ประมาณ 6 เมตร รอ 20 วินาที แล้วค่อยกลับมาเรียนกันค่ะ`;
    if(grade<=4)return `ถึงเวลาพักสายตาแล้วค่ะ น้อง${name} มองไปยังสิ่งที่อยู่ไกลประมาณ 6 เมตร สัก 20 วินาที แล้วเราค่อยเรียนต่อกันนะคะ`;
    return `น้อง${name} พักสายตาสักครู่นะคะ มองไปยังสิ่งที่อยู่ไกลประมาณ 6 เมตร เป็นเวลา 20 วินาที แล้วพร้อมแล้วค่อยเรียนต่อค่ะ`;
  }
  function startEyeBreak(){
    eyeRestSeconds=20;const overlay=document.getElementById('eyeBreakOverlay');
    if(overlay){overlay.classList.add('show');overlay.setAttribute('aria-hidden','false')}
    const count=document.getElementById('eyeBreakCountdown');if(count)count.textContent=String(eyeRestSeconds);
    if(voiceEnabled)coach(ageBreakLine());renderDailyTimer();persist();
  }
  function endEyeBreak(){
    eyeRestSeconds=0;const overlay=document.getElementById('eyeBreakOverlay');
    if(overlay){overlay.classList.remove('show');overlay.setAttribute('aria-hidden','true')}
    if(voiceEnabled)coach(`ครบ 20 วินาทีแล้วค่ะ น้อง${studentLabel()} พักสายตาได้ดีมาก พร้อมกลับมาเรียนต่อกันนะคะ`);
    renderDailyTimer();persist();
  }
  function tickStudyTimer(){
    const now=Date.now(),elapsed=Math.min(2,Math.max(0,Math.floor((now-lastTick)/1000)));lastTick=now;
    if(eyeRestSeconds>0){if(document.visibilityState==='visible'&&elapsed){eyeRestSeconds=Math.max(0,eyeRestSeconds-elapsed);const count=document.getElementById('eyeBreakCountdown');if(count)count.textContent=String(eyeRestSeconds);renderDailyTimer();if(eyeRestSeconds===0)endEyeBreak()}return}
    if(!learningViewActive()||!elapsed)return;
    const p=child(),today=dayKey(),key=today;if(p.eyeBreakFocusDay!==today){p.eyeBreakFocusDay=today;p.eyeBreakFocusSeconds=0}
    p.studySecondsByDay=p.studySecondsByDay||{};p.studySecondsByDay[key]=(p.studySecondsByDay[key]||0)+elapsed;p.eyeBreakFocusSeconds=(p.eyeBreakFocusSeconds||0)+elapsed;saveTicks+=elapsed;renderDailyTimer();if(saveTicks>=10){persist();saveTicks=0}
    if(p.eyeBreakFocusSeconds>=EYE_BREAK_SECONDS){p.eyeBreakFocusSeconds=0;startEyeBreak();return}
    maybeCelebrate();
  }


  function readProgress(){const v=versionData();v.readDone=v.readDone||{};const keys=activeUnit.items.map((_,i)=>`${activeUnit.id}:${i}`);return{done:keys.filter(k=>v.readDone[k]).length,total:keys.length,complete:keys.every(k=>v.readDone[k])}}
  function lessonFlags(){const v=versionData();v.activityDone=v.activityDone||{};const s=v.activityDone[activeUnit.id]||{};return{listen:!!s.listen,order:!!s.order,spell:!!s.spell,talk:!!s.talk}}
  function allReady(){const r=readProgress(),f=lessonFlags();return r.complete&&f.listen&&f.order&&f.spell&&(!talkAvailable()||f.talk)}
  function renderActivityGate(){
    const box=document.getElementById('lessonGameGate');if(!box)return;
    const r=readProgress(),f=lessonFlags(),hasTalk=talkAvailable(),ready=r.complete&&f.listen&&f.order&&f.spell&&(!hasTalk||f.talk);
    box.innerHTML=`<div class="skill-status"><span>${r.complete?'✅':'📖'} อ่านออกเสียง ${r.done}/${r.total}</span><span>${f.listen?'✅':'👂'} ฟังจับคู่</span><span>${f.order?'✅':'🧩'} เรียงประโยค</span><span>${f.spell?'✅':'✍️'} เขียนคำศัพท์</span>${hasTalk?`<span>${f.talk?'✅':'🗣️'} สนทนากับครู AI</span>`:''}</div><p class="muted">${ready?'ทำกิจกรรมครบแล้ว ปลดล็อกเกมประจำบทเรียบร้อย!':'ทำกิจกรรมฝึกให้ครบทุกข้อ แล้วมาเล่นเกมทบทวนกันนะ'}</p><button class="primary" id="startLessonGame" ${ready?'':'disabled'}>🎮 ${ready?'เริ่มเกมทบทวนบทนี้':'🔒 เกมจะเปิดเมื่อฝึกครบ'}</button>`;
    const b=document.getElementById('startLessonGame');if(b)b.onclick=()=>startQuiz();
  }
  window.renderStudy=function(){
    const root=document.getElementById('studyView');quiz=null;
    if(!activeUnit){root.innerHTML='<div class="panel">ยังไม่มีบทเรียนให้เลือก</div>';return}
    const flags=lessonFlags(),rp=readProgress(),hasTalk=talkAvailable();
    const card=(icon,title,desc,status,action,cls='')=>`<button class="activity-choice ${cls}" type="button" data-activity="${action}"><span class="activity-choice-icon">${icon}</span><span class="activity-choice-copy"><strong>${title}</strong><small>${desc}</small></span><span class="activity-choice-status">${status}</span></button>`;
    const ready=allReady();
    root.innerHTML=`<div class="section-head"><div><h2>เลือกกิจกรรมวันนี้</h2><p>${activeUnit.emoji} ${escapeHTML(activeUnit.title)} · ${escapeHTML(activeUnit.th)} · ป.${child().grade}</p></div><button class="secondary" onclick="showView('lessonsView')">บทเรียนทั้งหมด</button></div><div class="panel activity-menu-panel"><div class="activity-welcome"><div class="activity-welcome-emoji">🌈</div><div><h3>วันนี้อยากเริ่มอะไรดีคะ?</h3><p class="muted">เลือกหัวข้อที่ชอบได้เลย ทำทีละอย่างตามสบายค่ะ</p></div></div><div class="activity-choice-grid">${card('📚','คำศัพท์ประจำบท','ดูคำศัพท์ ฟังเสียง และความหมาย',`${activeUnit.items.length} คำ`,'vocab','vocab-choice')}${card('🎙️','ฝึกอ่านกับครูผู้ช่วย','อ่านประโยคแล้วฟังคำชมตามชื่อ',`${rp.done}/${rp.total} ประโยค`,'reading','reading-choice')}${card('👂','ฟังแล้วจับคู่','ฟังคำศัพท์แล้วเลือกความหมาย',flags.listen?'ทำแล้ว':'เริ่มฝึก','listen','listen-choice')}${card('🧩','เรียงคำเป็นประโยค','จัดคำให้เป็นประโยคภาษาอังกฤษ',flags.order?'ทำแล้ว':'เริ่มฝึก','order','order-choice')}${card('✍️','ฝึกเขียนคำศัพท์','ดูคำใบ้ภาษาไทยแล้วพิมพ์คำตอบ',flags.spell?'ทำแล้ว':'เริ่มฝึก','spell','spell-choice')}${hasTalk?card('🗣️','พูดคุยกับครู AI','ฟังความหมายคำถามภาษาไทย แล้วตอบเป็นภาษาอังกฤษ',flags.talk?'ทำแล้ว':'เริ่มฝึก','talk','talk-choice'):''}</div><div class="game-unlock-panel"><div class="game-unlock-title"><span>🎮</span><div><strong>${ready?'เกมทบทวนเปิดแล้ว!':'ทำกิจกรรมให้ครบเพื่อเปิดเกม'}</strong><small>${hasTalk?'บทนี้ต้องฝึกอ่าน ฟังจับคู่ เรียงประโยค เขียนคำศัพท์ และสนทนากับครู AI':'เกมจะเปิดเมื่ออ่านออกเสียง ฟังจับคู่ เรียงประโยค และเขียนคำศัพท์ครบ'}</small></div></div><div class="game-unlock-status"><span>${rp.complete?'✅':'📖'} อ่านออกเสียง</span><span>${flags.listen?'✅':'👂'} ฟังจับคู่</span><span>${flags.order?'✅':'🧩'} เรียงประโยค</span><span>${flags.spell?'✅':'✍️'} เขียนคำศัพท์</span>${hasTalk?`<span>${flags.talk?'✅':'🗣️'} สนทนากับครู AI</span>`:''}</div><button class="primary game-launch" id="startLessonGame" ${ready?'':'disabled'}>${ready?'เริ่มเกมทบทวนบทนี้ 🎉':'🔒 เกมยังล็อกอยู่'}</button></div></div>`;
    root.querySelectorAll('[data-activity]').forEach(b=>b.onclick=()=>{const type=b.dataset.activity;if(type==='vocab')renderVocabulary();else if(type==='reading')renderReading();else if(type==='listen')startListenMatch();else if(type==='order')startSentenceOrder();else if(type==='spell')startSpelling();else if(type==='talk')startTalk()});
    document.getElementById('startLessonGame').onclick=()=>startQuiz();
  };
  function startTalk(){
    const grade=Number(child().grade),band=grade<=2?1:grade<=4?2:3,version=activeVersion;
    const lessonTalk=P2_V1_TALK_BANK[activeUnit.id];
    const items=isDailyLifeUnit()?TALK_BANK[band][version].map((q,i)=>({...q,meaning:TALK_MEANINGS[band][version][i]})):(lessonTalk||buildLessonTalk(activeUnit));
    talkSession={items:[...items],index:0,attempts:0,score:0,resolved:false,awaitingRepeat:false,correctionAttempts:0};
    renderTalkQuestion(true);
  }
  function talkAnswer(q){return q.answer.replaceAll('{name}',studentLabel()).replaceAll('{grade}',String(child().grade))}
  function talkIntro(q){
    const grade=Number(child().grade);
    const direction=grade===1?'ตอบเป็นคำหรือประโยคสั้น ๆ ภาษาอังกฤษก็ได้นะคะ':grade===2?'ตอบเป็นประโยคภาษาอังกฤษสั้น ๆ นะคะ':grade===3?'ลองตอบเป็นประโยคภาษาอังกฤษให้ครบใจความนะคะ':grade===4?'ตอบเป็นประโยคเต็ม และลองเพิ่มรายละเอียดอีกนิดนะคะ':grade===5?'ลองตอบเป็นประโยคเต็มพร้อมรายละเอียดนะคะ':'ลองตอบเป็นภาษาอังกฤษสองประโยคหรือให้เหตุผลง่าย ๆ ได้นะคะ';
    const extension=activeVersion===2?' บทนี้เป็นเวอร์ชันต่อยอด ลองเพิ่มรายละเอียดอีกนิดค่ะ':'';
    return `น้อง${name}คะ ${q.meaning} ${direction}${extension}`;
  }
  function speakTalkLines(q,answer=null){
    if(!voiceEnabled||!('speechSynthesis'in window))return;
    speechSynthesis.cancel();
    const lines=[[talkIntro(q),'th-TH',.92],[q.en,'en-US',.78]];
    if(answer)lines.push([`คำตอบตัวอย่างคือ ${answer}`,'th-TH',.9],[answer,'en-US',.76]);
    lines.forEach(([text,lang,rate])=>{const u=new SpeechSynthesisUtterance(text);u.lang=lang;u.rate=rate;const voice=speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith(lang.split('-')[0]));if(voice)u.voice=voice;speechSynthesis.speak(u)});
  }
  function renderTalkQuestion(autoplay=false){
    const root=document.getElementById('studyView'),q=talkSession.items[talkSession.index],answer=talkAnswer(q),grade=Number(child().grade),total=talkSession.items.length;
    root.innerHTML=`<div class="section-head"><div><h2>🗣️ พูดคุยกับครู AI</h2><p>ป.${grade} · เวอร์ชัน ${activeVersion} · ข้อ ${talkSession.index+1} จาก ${total}</p></div><button class="secondary" id="talkBack">กลับเมนูกิจกรรม</button></div><div class="panel talk-panel"><div class="talk-progress"><span class="tag">${escapeHTML(q.topic)}</span><span>${talkSession.attempts}/3 ครั้งที่ลอง</span></div><div class="talk-instruction">${escapeHTML(talkIntro(q))}</div><div class="talk-question"><div class="eyebrow">ครูถามเป็นภาษาอังกฤษ</div><strong>${escapeHTML(q.en)}</strong><button class="small-btn" id="repeatTalkQuestion">🔊 ฟังคำถามอีกครั้ง</button></div><p class="muted">แตะไมโครโฟนเพื่อตอบ หรือพิมพ์คำตอบด้านล่างได้ค่ะ</p><div class="form-row talk-controls"><button class="mic-btn" id="talkMic">🎙️ ตอบด้วยเสียง</button></div><label class="talk-answer-label" for="talkAnswerInput">คำตอบที่ระบบฟังได้ / พิมพ์คำตอบ</label><input id="talkAnswerInput" class="talk-answer-input" type="text" autocomplete="off" autocapitalize="sentences" placeholder="พิมพ์คำตอบภาษาอังกฤษที่นี่"><div class="feedback" id="talkFeedback" aria-live="polite">ตอบเป็นภาษาอังกฤษนะคะ</div><div class="form-row talk-actions"><button class="primary" id="checkTalkAnswer">ตรวจคำตอบ</button><button class="primary" id="nextTalkQuestion" hidden>ข้อต่อไป</button></div><p class="install-hint">ระบบไมโครโฟนอาจฟังคลาดเคลื่อน หากข้อความที่ได้ยินไม่ตรง สามารถแก้ข้อความก่อนตรวจคำตอบได้ คำตอบของเด็กจะไม่ถูกบันทึก</p></div>`;
    document.getElementById('talkBack').onclick=backToStudy;
    document.getElementById('repeatTalkQuestion').onclick=()=>speakTalkLines(q);
    document.getElementById('talkMic').onclick=listenTalkAnswer;
    document.getElementById('checkTalkAnswer').onclick=checkTalkAnswer;
    document.getElementById('nextTalkQuestion').onclick=nextTalkQuestion;
    document.getElementById('talkAnswerInput').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();checkTalkAnswer()}};
    if(autoplay)speakTalkLines(q);
  }
  function listenTalkAnswer(){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition,btn=document.getElementById('talkMic'),fb=document.getElementById('talkFeedback');
    if(!SR){fb.textContent='อุปกรณ์นี้ยังไม่รองรับการฟังเสียงในแอป พิมพ์คำตอบแทนได้เลยค่ะ';return}
    if(talkRecognition){try{talkRecognition.abort()}catch(e){}}
    const rec=new SR();talkRecognition=rec;rec.lang='en-US';rec.interimResults=false;rec.maxAlternatives=3;btn.disabled=true;btn.textContent='กำลังฟัง…';btn.classList.add('listening');fb.className='feedback';fb.textContent='ครูกำลังฟังอยู่ พูดช้า ๆ ชัด ๆ ได้เลยค่ะ';
    rec.onresult=e=>{const heard=String(e.results?.[0]?.[0]?.transcript||'').trim();const input=document.getElementById('talkAnswerInput');if(input)input.value=heard;fb.className='feedback';fb.textContent=heard?`ระบบฟังได้ว่า “${heard}” ตรวจคำตอบได้เลย หรือแก้ข้อความก่อนก็ได้ค่ะ`:'ยังไม่ได้ยินคำตอบ ลองพูดอีกครั้งหรือพิมพ์คำตอบนะคะ'};
    rec.onerror=e=>{fb.className='feedback retry';fb.textContent=e.error==='not-allowed'?'กรุณาอนุญาตไมโครโฟนก่อนนะคะ สามารถพิมพ์คำตอบแทนได้':'ครูยังฟังไม่ชัด ลองอีกครั้งหรือพิมพ์คำตอบได้ค่ะ'};
    rec.onend=()=>{btn.disabled=false;btn.textContent='🎙️ ตอบด้วยเสียง';btn.classList.remove('listening');if(talkRecognition===rec)talkRecognition=null};
    try{rec.start()}catch(e){btn.disabled=false;btn.textContent='🎙️ ตอบด้วยเสียง';btn.classList.remove('listening');fb.textContent='ไมโครโฟนกำลังทำงานอยู่ ลองอีกครั้งนะคะ'}
  }
  function normalizeTalk(text){return String(text||'').toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim()}
  function talkAnswerAccepted(q,raw){
    const text=normalizeTalk(raw),words=text.split(' ').filter(Boolean);
    if(q.rule==='lessonWordUse'){const target=normalizeTalk(q.target),targetWords=target.split(' ');return targetWords.length===1?words.includes(target)&&words.length>=3:text.includes(target)&&words.length>=3}
    if(q.rule==='name'){const heardName=String(raw).toLocaleLowerCase().replace(/[.,!?]/g,' ').replace(/\s+/g,' ').trim(),profileName=String(studentLabel()).toLocaleLowerCase().replace(/[.,!?]/g,' ').replace(/\s+/g,' ').trim();return (!!profileName&&heardName===profileName)||/^(my name is|i am|im)\s+\w+/.test(text)}
    if(!text)return false;
    if(q.rule==='teacher')return /^(my teachers name is|my teacher is)\s+\w+/.test(text);
    if(q.rule==='mother')return /^(my mothers name is|my moms name is|my mother is|my mom is)\s+\w+/.test(text);
    if(q.rule==='exact')return q.accept.map(normalizeTalk).includes(text);
    if(q.rule==='prefix')return q.prefix.some(p=>text.startsWith(p))&&words.length>=3;
    if(q.rule==='school')return text.startsWith('my school is ')&&words.length>=4;
    if(q.rule==='afterSchool')return text.includes('after school')&&words.length>=4;
    if(q.rule==='help')return text.includes('help')&&words.length>=4;
    if(q.rule==='sequence')return text.includes('first')&&text.includes('then')&&words.length>=6;
    if(q.rule==='directionAsk')return text.includes('way')&&(text.includes('library')||text.includes('school'));
    if(q.rule==='order')return (text.startsWith('i would like ')||text.startsWith('id like '))&&words.length>=4;
    if(q.rule==='invite')return (text.includes('would you like')||text.includes('do you want'))&&text.includes('play');
    if(q.rule==='repeat')return text.includes('repeat')||text.includes('say that again')||text.includes('explain that again');
    if(q.rule==='favorite')return text.startsWith('my favorite subject is ')||text.startsWith('my favourite subject is ');
    if(q.rule==='because')return text.includes('because')&&words.length>=5;
    if(q.rule==='enjoy')return text.startsWith('i enjoy ')&&words.length>=4;
    if(q.rule==='slow')return text.includes('slowly')&&text.includes('please');
    return q.accept?.map(normalizeTalk).includes(text)||text===normalizeTalk(talkAnswer(q));
  }
  function checkTalkAnswer(){
    if(!talkSession||talkSession.resolved)return;
    const q=talkSession.items[talkSession.index],input=document.getElementById('talkAnswerInput'),raw=input.value.trim(),fb=document.getElementById('talkFeedback');
    if(!raw){fb.className='feedback retry';fb.textContent=talkSession.awaitingRepeat?'ลองพูดหรือพิมพ์ตามประโยคตัวอย่างก่อนนะคะ':'ลองตอบเป็นภาษาอังกฤษก่อนนะคะ';return}
    if(talkAnswerAccepted(q,raw)){
      talkSession.resolved=true;
      if(!talkSession.awaitingRepeat)talkSession.score++;
      playAnswerSound(true);fb.className='feedback good';fb.textContent=talkSession.awaitingRepeat?`ถูกต้องค่ะ พูดตามได้แล้ว เก่งมากเลย! 🌟`:`ถูกต้องค่ะ น้อง${studentLabel()} เก่งมากเลย! 🌟`;
      coach(talkSession.awaitingRepeat?`ดีมากค่ะ น้อง${studentLabel()} พูดตามได้ถูกต้องแล้ว ไปข้อต่อไปกันค่ะ`:`ถูกต้องค่ะ น้อง${studentLabel()} ตอบได้ดีมาก เก่งมากเลยค่ะ`);
      document.getElementById('checkTalkAnswer').hidden=true;document.getElementById('nextTalkQuestion').hidden=false;return;
    }
    playAnswerSound(false);
    if(talkSession.awaitingRepeat){
      talkSession.correctionAttempts=(talkSession.correctionAttempts||0)+1;
      fb.className='feedback retry';fb.textContent='ยังพูดตามไม่ตรงนะคะ ครูจะพูดตัวอย่างให้อีกครั้ง ลองฟังแล้วพูดตามช้า ๆ ค่ะ';
      coach(`ไม่เป็นไรค่ะ น้อง${studentLabel()} ฟังประโยคตัวอย่างอีกครั้ง แล้วลองพูดตามช้า ๆ นะคะ`);
      speakTalkLines(q,talkAnswer(q));input.value='';input.focus();return;
    }
    talkSession.attempts++;
    if(talkSession.attempts>=3){
      talkSession.awaitingRepeat=true;talkSession.correctionAttempts=0;
      const answer=talkAnswer(q);fb.className='feedback retry';
      fb.innerHTML=`ไม่เป็นไรนะคะ น้อง${escapeHTML(studentLabel())} ลองฟังประโยคตัวอย่าง แล้วพูดตามอีกครั้งค่ะ<br><strong>${escapeHTML(answer)}</strong>`;
      document.getElementById('checkTalkAnswer').textContent='ตรวจคำที่พูดตาม';
      input.value='';speakTalkLines(q,answer);input.focus();return;
    }
    fb.className='feedback retry';fb.textContent=`ยังไม่ตรงนะคะ ลองอีกครั้งค่ะ · ${talkSession.attempts}/3`;
    coach(`ไม่เป็นไรค่ะ น้อง${studentLabel()} ลองอีกครั้งนะคะ ${q.hint}`);input.value='';input.focus();
  }
  function nextTalkQuestion(){
    if(!talkSession?.resolved)return;
    if(talkSession.index<talkSession.items.length-1){talkSession.index++;talkSession.attempts=0;talkSession.resolved=false;talkSession.awaitingRepeat=false;talkSession.correctionAttempts=0;renderTalkQuestion(true);return}
    const v=versionData();v.activityDone=v.activityDone||{};v.activityDone[activeUnit.id]=v.activityDone[activeUnit.id]||{};v.activityDone[activeUnit.id].talk=true;v.points=(v.points||0)+Math.max(1,talkSession.score);save();
    const score=talkSession.score,total=talkSession.items.length;talkSession=null;
    document.getElementById('studyView').innerHTML=`<div class="panel talk-finish"><div class="success-emoji">🗣️⭐</div><h2>ฝึกสนทนาครบแล้วค่ะ!</h2><p>น้อง${escapeHTML(studentLabel())} ตอบถูกด้วยตัวเอง ${score} จาก ${total} ข้อ ขอบคุณที่ตั้งใจฝึกนะคะ</p><div class="form-row" style="justify-content:center"><button class="primary" id="talkFinishBack">กลับเมนูกิจกรรม</button><button class="secondary" id="talkFinishLessons">บทเรียนทั้งหมด</button></div></div>`;
    document.getElementById('talkFinishBack').onclick=backToStudy;document.getElementById('talkFinishLessons').onclick=()=>window.showView('lessonsView');coach(`น้อง${studentLabel()} ฝึกบทสนทนาครบแล้วค่ะ เก่งมากที่กล้าพูดภาษาอังกฤษ`);renderActivityGate();
  }
  function renderVocabulary(){
    const root=document.getElementById('studyView');
    root.innerHTML=`<div class="section-head"><div><h2>📚 คำศัพท์ประจำบท</h2><p>${escapeHTML(activeUnit.title)} · ${activeUnit.items.length} คำ</p></div><button class="secondary" id="activityBack">กลับเมนูกิจกรรม</button></div><div class="panel"><p class="muted">แตะ “ฟังคำศัพท์” แล้วลองพูดตามนะคะ</p><div class="word-list">${activeUnit.items.map((w,i)=>`<div class="word-row"><span class="word-emoji">${w[2]}</span><div><div class="word-en">${escapeHTML(w[0])}</div><div class="word-th">${escapeHTML(w[1])}</div></div><button class="speak-btn" data-vocab-index="${i}">ฟัง 🔊</button></div>`).join('')}</div></div>`;
    document.getElementById('activityBack').onclick=backToStudy;
    root.querySelectorAll('[data-vocab-index]').forEach(b=>b.onclick=()=>speak(activeUnit.items[Number(b.dataset.vocabIndex)][0]));
  }
  function renderReading(){
    const root=document.getElementById('studyView');
    root.innerHTML=`<div class="section-head"><div><h2>🎙️ ฝึกอ่านกับครูผู้ช่วย</h2><p>${escapeHTML(activeUnit.th)} · อ่านทีละประโยค</p></div><button class="secondary" id="activityBack">กลับเมนูกิจกรรม</button></div><div class="panel read-panel"><p class="muted">ฟังตัวอย่างก่อน แล้วลองอ่านออกเสียง ครูจะให้กำลังใจและบอกความหมายค่ะ</p><div class="read-box"><div class="tag" id="readProgress">ประโยคฝึกอ่าน</div><div class="read-target" id="readTarget"></div><div class="read-pronunciation" id="readPronunciation" aria-live="polite"></div><div class="read-translation" id="readTranslation"></div><div class="form-row"><button class="speak-btn" id="listenExample">🔊 ฟังตัวอย่าง</button><button class="mic-btn" id="readMic">🎙️ แตะเพื่ออ่าน</button></div><div class="form-row"><button class="small-btn" id="previousSentence">ประโยคก่อน</button><button class="small-btn" id="nextSentence">ประโยคถัดไป</button></div><div class="feedback" id="readFeedback" aria-live="polite">พร้อมแล้ว ลองพูดให้ชัดทีละคำได้เลย</div><div id="wordCorrection" class="word-correction" aria-live="polite"></div></div><p class="install-hint">การตรวจอ่านใช้คำที่ระบบถอดเสียงได้ อาจคลาดเคลื่อนตามสำเนียงหรืออุปกรณ์</p></div>`;
    document.getElementById('activityBack').onclick=backToStudy;setReadSentence(Math.min(readIndex,activeUnit.items.length-1));
  }
  window.save=function(){ensureData();baseSave();renderActivityGate();renderDailyTimer()};
  window.showView=function(id){tickStudyTimer();if(!handlingAppPop)pushAppView(id);baseShowView(id);lastTick=Date.now();renderDailyTimer()};
  window.startQuiz=function(){if(!allReady()){toast('ฝึกอ่าน ฟังจับคู่ เรียงประโยค และเขียนคำศัพท์ให้ครบก่อนนะ');renderActivityGate();return}return baseStartQuiz()};

  function startListenMatch(){
    activity={type:'listen',items:shuffle([...activeUnit.items]),index:0};
    renderListenMatch();
  }
  function renderListenMatch(){
    const item=activity.items[activity.index],others=activeUnit.items.filter(x=>x[1]!==item[1]);
    const options=shuffle([item[1],...shuffle(others).slice(0,3).map(x=>x[1])]);
    document.getElementById('studyView').innerHTML=`<div class="section-head"><div><h2>👂 ฟังแล้วจับคู่คำ</h2><p>${escapeHTML(activeUnit.th)} · ข้อ ${activity.index+1} จาก ${activity.items.length}</p></div><button class="secondary" id="activityBack"> กลับบทเรียน</button></div><div class="panel activity-card"><div class="activity-emoji">${item[2]}</div><p>แตะปุ่มฟัง แล้วเลือกความหมายของคำศัพท์นะคะ</p><button class="primary" id="listenWord">🔊 ฟังคำศัพท์</button><div class="quiz-options" id="listenChoices">${options.map((x,i)=>`<button class="option activity-option" data-i="${i}">${escapeHTML(x)}</button>`).join('')}</div><div id="activityFeedback" class="feedback" aria-live="polite"></div></div>`;
    document.getElementById('activityBack').onclick=backToStudy;
    document.getElementById('listenWord').onclick=()=>speak(item[0],.82);
    document.querySelectorAll('.activity-option').forEach((b,i)=>b.onclick=()=>answerListen(b,options[i],item));
  }
  function answerListen(btn,choice,item){
    document.querySelectorAll('.activity-option').forEach(b=>b.disabled=true);
    const fb=document.getElementById('activityFeedback');
    if(choice===item[1]){playAnswerSound(true);btn.classList.add('correct');fb.className='feedback good';fb.textContent='ถูกต้อง เก่งมาก!';coach(`ถูกต้องค่ะ น้อง${studentLabel()} ฟังคำศัพท์เก่งมาก`);setTimeout(()=>{activity.index++;if(activity.index<activity.items.length)renderListenMatch();else completeActivity('listen')},1000)}
    else{playAnswerSound(false);btn.classList.add('wrong');document.querySelectorAll('.activity-option').forEach(b=>{if(b.textContent===item[1])b.classList.add('correct')});fb.className='feedback retry';fb.textContent='ลองฟังอีกครั้งนะคะ แล้วเลือกคำตอบใหม่';coach(`ไม่เป็นไรค่ะ น้อง${studentLabel()} ลองฟังเสียงคำศัพท์อีกครั้ง แล้วเลือกใหม่ได้นะคะ`);setTimeout(()=>{document.querySelectorAll('.activity-option').forEach(b=>{b.disabled=false;b.classList.remove('wrong','correct')});fb.textContent='ลองอีกครั้งได้เลยค่ะ'},900)}
  }
  function startSpelling(){
    activity={type:'spell',items:shuffle([...activeUnit.items]),index:0,attempts:0,revealed:false,done:false};
    renderSpelling();
  }
  function renderSpelling(){
    const item=activity.items[activity.index],shown=activity.revealed;
    document.getElementById('studyView').innerHTML=`<div class="section-head"><div><h2>✍️ ฝึกเขียนคำศัพท์</h2><p>${escapeHTML(activeUnit.th)} · คำที่ ${activity.index+1} จาก ${activity.items.length}</p></div><button class="secondary" id="activityBack">กลับบทเรียน</button></div><div class="panel activity-card spell-card"><div class="tag">ดูความหมาย แล้วพิมพ์คำศัพท์ภาษาอังกฤษ</div><div class="spell-board"><div class="spell-count">${item[2]} คำที่ ${activity.index+1} / ${activity.items.length}</div><div class="spell-clue">${escapeHTML(item[1])}</div>${shown?`<div class="spell-answer" id="spellAnswer" aria-label="คำตอบที่ถูกต้อง"></div><div class="muted">สังเกตตัวอักษร แล้วลองพิมพ์คำนี้ด้วยตัวเองนะ</div>`:''}</div><label class="field spell-field"><span>พิมพ์คำภาษาอังกฤษ</span><input id="spellInput" class="spell-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="พิมพ์คำศัพท์ภาษาอังกฤษ"></label><div class="form-row spell-actions"><button class="primary" id="checkSpelling" ${activity.done?'disabled':''}>ตรวจคำตอบ</button><button class="secondary" id="nextSpelling" ${activity.done?'':'hidden'}>${activity.index===activity.items.length-1?'จบบทฝึก':'คำถัดไป'} →</button></div><div id="spellFeedback" class="feedback" aria-live="polite">คำใบ้: ${escapeHTML(item[1])} ลองพิมพ์เป็นภาษาอังกฤษนะคะ</div><p class="install-hint">${shown?'พิมพ์คำที่แสดงบนกระดานให้ถูกต้อง แล้วกดตรวจคำตอบ':'ถ้าตอบผิดเกิน 3 ครั้ง ครูจะช่วยแสดงคำตอบตัวใหญ่ให้ดู'}</p></div>`;
    document.getElementById('activityBack').onclick=backToStudy;
    const input=document.getElementById('spellInput');
    document.getElementById('checkSpelling').onclick=checkSpelling;
    input.onkeydown=e=>{if(e.key==='Enter'&&!activity.done){e.preventDefault();checkSpelling()}};
    document.getElementById('nextSpelling').onclick=nextSpelling;
    input.focus();
  }
  function saySpellingReveal(word){
    const box=document.getElementById('spellAnswer');
    const chars=Array.from(word).filter(ch=>/[a-z]/i.test(ch));
    if(box){box.innerHTML=Array.from(word).map(ch=>ch===' '?' <span class="spell-space">&nbsp;</span>':/[a-z]/i.test(ch)?`<span class="spell-letter">${escapeHTML(ch)}</span>`:`<span class="spell-space">${escapeHTML(ch)}</span>`).join('')}
    const nodes=box?[...box.querySelectorAll('.spell-letter')]:[];
    let active=-1;
    const showLetter=i=>{if(i<0||i>=nodes.length)return;if(active>=0)nodes[active].classList.remove('is-speaking');nodes[i].classList.add('is-visible','is-speaking');active=i};
    const names={a:'เอ',b:'บี',c:'ซี',d:'ดี',e:'อี',f:'เอฟ',g:'จี',h:'เอช',i:'ไอ',j:'เจ',k:'เค',l:'แอล',m:'เอ็ม',n:'เอ็น',o:'โอ',p:'พี',q:'คิว',r:'อาร์',s:'เอส',t:'ที',u:'ยู',v:'วี',w:'ดับเบิลยู',x:'เอ็กซ์',y:'วาย',z:'แซด'};
    const thaiIntro=voice(`ไม่เป็นไรค่ะ น้อง${studentLabel()} คำนี้สะกดทีละตัวนะคะ`,'th-TH',.94);
    const sayWord=()=>{const speakEncouragement=()=>{const closing=voice(`น้อง${studentLabel()} ลองเขียนตามคุณครูบอกนะคะ`,'th-TH',.94);if(closing)speechSynthesis.speak(closing)};const speakEnglish=()=>{const spoken=voice(word,'en-US',.78);if(spoken){spoken.onend=speakEncouragement;spoken.onerror=speakEncouragement;speechSynthesis.speak(spoken)}else speakEncouragement()};const prompt=voice('อ่านว่า','th-TH',.92);if(prompt){prompt.onend=speakEnglish;prompt.onerror=speakEnglish;speechSynthesis.speak(prompt)}else speakEnglish()};
    speechSynthesis.cancel();
    if(!thaiIntro){chars.forEach((_,i)=>setTimeout(()=>showLetter(i),i*450));return}
    thaiIntro.onend=()=>{
      let i=0;
      const speakNext=()=>{
        if(i>=chars.length){sayWord();return}
        const letter=chars[i],utterance=voice(names[letter.toLowerCase()]||letter,'th-TH',.9);
        if(!utterance){showLetter(i++);setTimeout(speakNext,430);return}
        const index=i++;utterance.onstart=()=>showLetter(index);utterance.onend=speakNext;speechSynthesis.speak(utterance);
      };
      speakNext();
    };
    speechSynthesis.speak(thaiIntro);
  }
  function checkSpelling(){
    if(activity.done)return;
    const item=activity.items[activity.index],input=document.getElementById('spellInput'),fb=document.getElementById('spellFeedback');
    const normalizeWord=s=>(s||'').toLowerCase().trim().replace(/\s+/g,' ');
    if(normalizeWord(input.value)===normalizeWord(item[0])){
      activity.done=true;playAnswerSound(true);fb.className='feedback good';fb.textContent=`เก่งมากค่ะ น้อง${studentLabel()} เขียน “${item[0]}” ได้ถูกต้อง!`;
      document.getElementById('checkSpelling').disabled=true;document.getElementById('nextSpelling').hidden=false;
      coach(`เก่งมากค่ะ น้อง${studentLabel()} เขียนคำว่า ${item[0]} ได้ถูกต้องเลยค่ะ`);return;
    }
    activity.attempts++;playAnswerSound(false);
    if(activity.attempts>3&&!activity.revealed){activity.revealed=true;renderSpelling();const revealFeedback=document.getElementById('spellFeedback');revealFeedback.className='feedback retry';revealFeedback.textContent=`ไม่เป็นไรค่ะ น้อง${studentLabel()} ดูคำตอบตัวใหญ่ แล้วลองพิมพ์ตามอีกครั้งนะคะ`;saySpellingReveal(item[0]);document.getElementById('spellInput').focus();return;}
    fb.className='feedback retry';fb.textContent=activity.revealed?'ยังไม่ตรงค่ะ ลองดูคำบนกระดานแล้วพิมพ์อีกครั้งนะคะ':`ยังไม่ตรง ลองอีกครั้งนะคะ (${activity.attempts}/4)`;if(!activity.revealed)coach(`พยายามได้ดีค่ะ น้อง${studentLabel()} ลองนึกถึงตัวอักษรของคำว่า ${item[1]} แล้วเขียนใหม่อีกครั้งนะคะ`);input.focus();input.select();
  }
  function nextSpelling(){
    if(!activity.done)return;
    if(activity.index<activity.items.length-1){activity.index++;activity.attempts=0;activity.revealed=false;activity.done=false;renderSpelling();return;}
    completeActivity('spell');
  }
  function startSentenceOrder(){
    const pool=activeUnit.items.filter(w=>w[3]&&w[3].trim());
    activity={type:'order',items:shuffle(pool).slice(0,Math.min(3,pool.length)),index:0,chosen:[]};
    renderSentenceOrder();
  }
  function renderSentenceOrder(){
    const item=activity.items[activity.index],words=item[3].replace(/[.!?]+$/,'').split(/\s+/),scramble=shuffle(words.map((word,index)=>({word,index}))).filter(x=>!activity.chosen.includes(x.index));
    const chosen=activity.chosen.map(i=>words[i]);
    document.getElementById('studyView').innerHTML=`<div class="section-head"><div><h2>🧩 เรียงคำเป็นประโยค</h2><p>${escapeHTML(activeUnit.th)} · ประโยค ${activity.index+1} จาก ${activity.items.length}</p></div><button class="secondary" id="activityBack"> กลับบทเรียน</button></div><div class="panel activity-card"><p class="muted">ความหมาย: ${escapeHTML(item[4]||'ลองเรียงคำให้เป็นประโยคภาษาอังกฤษ')}</p><div class="answer-tray" id="answerTray">${chosen.length?chosen.map((w,i)=>`<button class="word-chip selected-word" data-chosen="${i}">${escapeHTML(w)}</button>`).join(''):'<span class="muted">แตะคำด้านล่างเพื่อเรียงประโยค</span>'}</div><div class="word-chips">${scramble.map(x=>`<button class="word-chip" data-word="${x.index}">${escapeHTML(x.word)}</button>`).join('')}</div><div class="form-row"><button class="primary" id="checkSentence">ตรวจคำตอบ</button><button class="secondary" id="clearSentence">ล้างคำที่เลือก</button></div><div id="activityFeedback" class="feedback" aria-live="polite"></div></div>`;
    document.getElementById('activityBack').onclick=backToStudy;
    document.querySelectorAll('[data-word]').forEach(b=>b.onclick=()=>{activity.chosen.push(Number(b.dataset.word));renderSentenceOrder()});
    document.querySelectorAll('[data-chosen]').forEach(b=>b.onclick=()=>{activity.chosen.splice(Number(b.dataset.chosen),1);renderSentenceOrder()});
    document.getElementById('clearSentence').onclick=()=>{activity.chosen=[];renderSentenceOrder()};
    document.getElementById('checkSentence').onclick=checkSentence;
  }
  function checkSentence(){
    const item=activity.items[activity.index],target=normalize(item[3]),words=item[3].replace(/[.!?]+$/,'').split(/\s+/),answer=activity.chosen.map(i=>words[i]).join(' '),fb=document.getElementById('activityFeedback');
    if(normalize(answer)===target){playAnswerSound(true);fb.className='feedback good';fb.textContent='เรียงได้ถูกต้อง เก่งมากค่ะ!';coach(`เก่งมากค่ะ น้อง${studentLabel()} เรียงประโยคได้ถูกต้อง`);setTimeout(()=>{activity.index++;activity.chosen=[];if(activity.index<activity.items.length)renderSentenceOrder();else completeActivity('order')},900)}
    else{playAnswerSound(false);fb.className='feedback retry';fb.textContent='ยังไม่ตรง ลองสลับตำแหน่งคำอีกครั้งนะคะ';coach(`ลองอีกครั้งนะคะ น้อง${studentLabel()} ค่อย ๆ คิดว่าแต่ละคำควรอยู่ตรงไหน`)}
  }
  function completeActivity(type){
    const v=versionData();v.activityDone=v.activityDone||{};v.activityDone[activeUnit.id]=v.activityDone[activeUnit.id]||{};v.activityDone[activeUnit.id][type]=true;
    ensureData();persist();baseShowView('studyView');renderStudy();
    coach(type==='listen'?`ทำกิจกรรมฟังจับคู่สำเร็จแล้วค่ะ น้อง${studentLabel()} เก่งมาก ฝึกกิจกรรมที่เหลือให้ครบแล้วเกมจะเปิดนะคะ`:type==='order'?`ทำกิจกรรมเรียงประโยคสำเร็จแล้วค่ะ น้อง${studentLabel()} เก่งมาก ฝึกกิจกรรมที่เหลือให้ครบแล้วเกมจะเปิดนะคะ`:`ทำแบบฝึกเขียนคำศัพท์ครบแล้วค่ะ น้อง${studentLabel()} เก่งมาก ทำกิจกรรมที่เหลือให้ครบแล้วเกมจะเปิดนะคะ`);
  }
  function backToStudy(){if(talkRecognition){try{talkRecognition.abort()}catch(e){}talkRecognition=null}if('speechSynthesis'in window)speechSynthesis.cancel();talkSession=null;activity=null;baseShowView('studyView');renderStudy()}

  function correctionPositions(target,said){
    const a=normalize(target).split(' ').filter(Boolean),b=normalize(said).split(' ').filter(Boolean),dp=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));
    for(let i=a.length-1;i>=0;i--)for(let j=b.length-1;j>=0;j--)dp[i][j]=a[i]===b[j]?1+dp[i+1][j+1]:Math.max(dp[i+1][j],dp[i][j+1]);
    const missing=[];let i=0,j=0;while(i<a.length&&j<b.length){if(a[i]===b[j]){i++;j++}else if(dp[i+1][j]>=dp[i][j+1])missing.push(i++);else j++}while(i<a.length)missing.push(i++);return{a,missing};
  }
  window.showSuccessCelebration=function(){
    const overlay=document.getElementById('successOverlay');if(!overlay)return;
    const lines=[`เก่งมากค่ะ น้อง${studentLabel()}!`,`ยอดเยี่ยมเลยค่ะ น้อง${studentLabel()}!`,`สุดยอดไปเลยค่ะ น้อง${studentLabel()}!`];
    document.getElementById('successPraise').textContent=lines[Math.floor(Math.random()*lines.length)];
    overlay.classList.remove('show');void overlay.offsetWidth;overlay.classList.add('show');overlay.setAttribute('aria-hidden','false');
    clearTimeout(celebrationTimer);celebrationTimer=setTimeout(()=>{overlay.classList.remove('show');overlay.setAttribute('aria-hidden','true')},1700);
  };
  function voice(text,lang,rate){if(!voiceEnabled||!('speechSynthesis'in window))return;const u=new SpeechSynthesisUtterance(text);u.lang=lang;u.rate=rate;const v=speechSynthesis.getVoices().find(x=>x.lang.toLowerCase().startsWith(lang.split('-')[0]));if(v)u.voice=v;return u}
  function coachThenPronounce(words){
    const thai=voice(`เสียงใกล้เคียงแล้วค่ะ น้อง${studentLabel()} ลองฝึกคำที่ไฮไลต์ก่อน แล้วอ่านประโยคเดิมอีกครั้งนะคะ`,'th-TH',.94);
    if(!thai)return;
    speechSynthesis.cancel();thai.onend=()=>{const en=voice(words.join(', '),'en-US',.58);if(en)speechSynthesis.speak(en)};speechSynthesis.speak(thai);
  }
  function coachCorrectReading(target,meaningText,onComplete){
    const finish=()=>{if(typeof onComplete==='function')onComplete()};
    if(!voiceEnabled||!('speechSynthesis'in window)){finish();return}
    const praise=voice(`เก่งมากค่ะน้อง${studentLabel()} อ่านประโยคนี้ได้ถูกต้องแล้วนะคะ`,'th-TH',.94),english=voice(target,'en-US',.78),meaning=voice(`ประโยคนี้แปลว่า ${meaningText} ค่ะ`,'th-TH',.92);
    if(!praise||!english||!meaning){finish();return}
    speechSynthesis.cancel();meaning.onend=finish;meaning.onerror=finish;praise.onend=()=>{english.onend=()=>speechSynthesis.speak(meaning);speechSynthesis.speak(english)};speechSynthesis.speak(praise);
  }

  function showWordCorrection(target,said){
    const result=correctionPositions(target,said),missingSet=new Set(result.missing),targetEl=document.getElementById('readTarget'),box=document.getElementById('wordCorrection');
    if(!targetEl||!box)return result;
    let wordIndex=0;targetEl.innerHTML=target.split(/(\s+)/).map(part=>{if(/^\s+$/.test(part))return part;const i=wordIndex++,safe=escapeHTML(part);return missingSet.has(i)?`<span class="word-needs-practice">${safe}</span>`:safe}).join('');
    const words=result.missing.map(i=>result.a[i]);
    box.innerHTML=words.length?`<p>คำที่ลองฝึกเพิ่ม: <b>${words.map(escapeHTML).join(', ')}</b></p><div class="word-correction-buttons">${words.map((w,i)=>`<button class="small-btn" data-correction="${i}">🔊 ฟัง “${escapeHTML(w)}”</button>`).join('')}</div>`:'';
    box.querySelectorAll('[data-correction]').forEach((b,i)=>b.onclick=()=>speak(words[i],.58,'en-US'));
    return{...result,words};
  }
  window.recognize=function(target){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition,fb=document.getElementById('readFeedback'),btn=document.getElementById('readMic');
    if(!SR){fb.textContent='เบราว์เซอร์นี้ยังตรวจเสียงอ่านไม่ได้ ลองใช้ Chrome แล้วอนุญาตไมโครโฟนนะ';fb.className='feedback retry';coach(`น้อง${studentLabel()} คะ อุปกรณ์นี้ยังฟังเสียงอ่านไม่ได้ ลองเปิดใน Chrome และอนุญาตไมโครโฟนนะคะ`);return}
    const rec=new SR();rec.lang='en-US';rec.interimResults=false;rec.maxAlternatives=1;btn.classList.add('listening');btn.textContent='กำลังฟัง…';fb.className='feedback';fb.textContent='กำลังฟังนะ ลองพูดประโยคให้จบ';
    rec.onresult=e=>{
      const said=e.results[0][0].transcript,v=versionData(),key=activeUnit.id+':'+readIndex;v.readAttempts=(v.readAttempts||0)+1;
      const result=showWordCorrection(target,said),score=Math.round((result.a.length-result.missing.length)/Math.max(1,result.a.length)*100);
      if(!result.missing.length){playAnswerSound(true);fb.className='feedback good';fb.textContent=`เก่งมากค่ะ น้อง${studentLabel()} ระบบฟังได้ครบทุกคำ “${said}” 🌟`;document.getElementById('wordCorrection').textContent='';if(!v.readDone[key]){v.readDone[key]=true;v.points+=1;toast('+1 คะแนนความกล้าอ่าน')}save();renderActivityGate();coachCorrectReading(target,activeUnit.items[readIndex]?.[4]||translateSentence(target),()=>{if(readIndex<activeUnit.items.length-1)setTimeout(()=>setReadSentence(readIndex+1),500);else setTimeout(()=>{fb.textContent=`อ่านครบทุกประโยคแล้ว เก่งมากค่ะ น้อง${studentLabel()} 🌟`;coach(`น้อง${studentLabel()} อ่านครบทุกประโยคแล้ว เก่งมากค่ะ วันนี้พยายามได้ดีมากเลย`);renderActivityGate()},500)})}
      else{fb.className='feedback retry';fb.textContent=`เสียงใกล้เคียงแล้วค่ะ (${score}%) ลองฝึกคำที่ไฮไลต์ แล้วอ่านประโยคเดิมอีกครั้งนะคะ`;save();coachThenPronounce(result.words)}
    };
    rec.onerror=e=>{fb.className='feedback retry';fb.textContent=e.error==='not-allowed'?'ต้องอนุญาตใช้ไมโครโฟนก่อนนะ':'ยังฟังไม่ชัด ลองอีกครั้งในที่เงียบ ๆ นะ';if(e.error==='not-allowed')coach(`น้อง${studentLabel()} คะ ต้องอนุญาตใช้ไมโครโฟนก่อน ครูถึงจะฟังเสียงอ่านได้ค่ะ`);else if(e.error!=='no-speech')coach(`ครูยังฟังไม่ชัดค่ะ น้อง${studentLabel()} ลองอีกครั้งในที่เงียบ ๆ นะคะ`)};
    rec.onend=()=>{btn.classList.remove('listening');btn.textContent='🎙️ แตะเพื่ออ่าน'};
    try{rec.start()}catch(e){btn.classList.remove('listening');btn.textContent='🎙️ แตะเพื่ออ่าน';fb.textContent='ไมโครโฟนกำลังทำงานอยู่ ลองอีกครั้งนะ'}
  };

  const ALPHA=Array.from('abcdefghijklmnopqrstuvwxyz');
  const ALPHA_VOWELS=new Set(['a','e','i','o','u']);
  const ALPHA_NAMES={a:'เอ',b:'บี',c:'ซี',d:'ดี',e:'อี',f:'เอฟ',g:'จี',h:'เอช',i:'ไอ',j:'เจ',k:'เค',l:'แอล',m:'เอ็ม',n:'เอ็น',o:'โอ',p:'พี',q:'คิว',r:'อาร์',s:'เอส',t:'ที',u:'ยู',v:'วี',w:'ดับเบิลยู',x:'เอ็กซ์',y:'วาย',z:'แซด'};
  const ALPHA_EXAMPLES={a:['apple','แอปเปิล','แอะ'],b:['ball','ลูกบอล','บ'],c:['cat','แมว','ค'],d:['dog','สุนัข','ด'],e:['egg','ไข่','เอะ'],f:['fish','ปลา','ฟ'],g:['goat','แพะ','ก'],h:['hat','หมวก','ฮ'],i:['igloo','บ้านน้ำแข็ง','อิ'],j:['jam','แยม','จ'],k:['kite','ว่าว','ค'],l:['lion','สิงโต','ล'],m:['moon','ดวงจันทร์','ม'],n:['nose','จมูก','น'],o:['orange','ส้ม','ออ'],p:['pen','ปากกา','พ'],q:['queen','ราชินี','คว'],r:['red','สีแดง','ร'],s:['sun','ดวงอาทิตย์','ส'],t:['top','ลูกข่าง','ท'],u:['umbrella','ร่ม','อะ'],v:['van','รถตู้','ว'],w:['web','ใยแมงมุม','ว'],x:['box','กล่อง','กซ์'],y:['yes','ใช่','ย'],z:['zoo','สวนสัตว์','ซ']};
  const ALPHA_MODE_LABEL={find:'หาตัวอักษรบนคีย์บอร์ด',match:'จับคู่ตัวพิมพ์ใหญ่–เล็ก',vowel:'แยกสระกับพยัญชนะ'};
  let alphaGame=null;
  function alphaLocalDay(value){const d=value?new Date(value):new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
  function gradeForScore(score){return score>=80?'A':score>=70?'B':score>=60?'C':'D'}
  function gradeMeaning(g){return g==='A'?'ยอดเยี่ยม':g==='B'?'ดีมาก':g==='C'?'กำลังพัฒนา':'ควรฝึกเพิ่ม'}
  function alphabetAdvice(skill,title){
    if(skill==='find')return 'ฝึกหาตัวพิมพ์เล็กและตัวพิมพ์ใหญ่บนคีย์บอร์ดแบบสุ่ม วันละ 5 นาที';
    if(skill==='match')return 'ทบทวนคู่ตัวอักษร เช่น A–a, B–b แล้วลองจับคู่ชุดละ 5 ตัว';
    if(skill==='vowel')return 'ทบทวนสระ A, E, I, O, U และเสียงสั้นจากคำ apple, egg, igloo, orange, umbrella';
    return 'กลับไปทบทวนบท “'+String(title||'').replace(/^บทเรียน[:： ]*/,'')+'” แล้วลองทำกิจกรรมเดิมอีกครั้ง';
  }
  function dayRecords(p){
    const rows=[];
    Object.values(p.courseData||{}).forEach(c=>Object.values(c.versions||{}).forEach(v=>(v.history||[]).forEach(h=>rows.push({date:h.date,score:Number(h.score)||0,skill:h.skill||'lesson',title:h.title||'บทเรียน'}))));
    (p.alphabetHistory||[]).forEach(h=>rows.push({date:h.date,score:Number(h.score)||0,skill:h.skill||'find',title:h.title||'เกมตัวอักษร'}));
    return rows.filter(x=>x.date&&Number.isFinite(x.score));
  }
  function renderDailyAssessment(){
    const panel=document.getElementById('dailyAssessmentPanel');if(!panel)return;
    const p=child(),today=alphaLocalDay(),rows=dayRecords(p),days={};
    rows.forEach(r=>{const key=alphaLocalDay(r.date);(days[key]||(days[key]=[])).push(r)});
    const keys=Object.keys(days).sort((a,b)=>b.localeCompare(a)).slice(0,7);
    const todayRows=days[today]||[];
    let todayBlock='';
    if(!todayRows.length)todayBlock='<div class="daily-day-card"><div class="daily-day-head"><div><strong>วันนี้ยังไม่มีข้อมูล</strong><div class="muted">เริ่มฝึกเมื่อพร้อม แล้วผลของวันนี้จะแสดงตรงนี้</div></div><span class="daily-grade">—</span></div><div class="form-row"><button class="primary" onclick="openAlphabetPractice()">เริ่มฝึกตัวอักษรและสระ</button></div></div>';
    else{
      const avg=Math.round(todayRows.reduce((n,r)=>n+r.score,0)/todayRows.length),g=gradeForScore(avg);
      const skills={};todayRows.forEach(r=>{const k=r.skill||'lesson';(skills[k]||(skills[k]=[])).push(r)});
      const weakest=Object.entries(skills).map(([skill,list])=>({skill,list,score:Math.round(list.reduce((n,r)=>n+r.score,0)/list.length)})).sort((a,b)=>a.score-b.score)[0];
      const recommendation=weakest?alphabetAdvice(weakest.skill,weakest.list[0].title):'ฝึกต่อเนื่องวันละนิด แล้วกลับมาทบทวนอีกครั้ง';
      todayBlock='<div class="daily-day-card"><div class="daily-day-head"><div><strong>ผลประเมินวันนี้</strong><div class="muted">'+todayRows.length+' กิจกรรม · คะแนนเฉลี่ย '+avg+'%</div></div><span class="daily-grade">'+g+'</span></div><div class="daily-meter"><i style="width:'+avg+'%"></i></div><div><b>'+gradeMeaning(g)+'</b> · '+(g==='A'?'ทำได้คล่องแล้ว':g==='B'?'พื้นฐานดี ฝึกต่ออีกเล็กน้อย':g==='C'?'กำลังพัฒนา ควรทบทวน':'ฝึกซ้ำทีละน้อยได้เลย')+'</div><div class="daily-advice"><b>แนะนำ:</b> '+escapeHTML(recommendation)+'</div></div>';
    }
    const recent=keys.map(key=>{
      const list=days[key],avg=Math.round(list.reduce((n,r)=>n+r.score,0)/list.length),g=gradeForScore(avg),d=new Date(key+'T12:00:00').toLocaleDateString('th-TH',{day:'numeric',month:'short',year:'numeric'});
      const skillScores={};list.forEach(r=>{const k=r.skill||'lesson';(skillScores[k]||(skillScores[k]=[])).push(r.score)});
      const skills=Object.entries(skillScores).map(([k,vals])=>{const score=Math.round(vals.reduce((a,b)=>a+b,0)/vals.length),label=k==='find'?'หาตัวอักษรบนคีย์บอร์ด':k==='match'?'จับคู่พิมพ์ใหญ่–เล็ก':k==='vowel'?'สระและพยัญชนะ':'บทเรียน';return '<span class="tag">'+label+' '+score+'%</span>'}).join(' ');
      const lowest=list.slice().sort((a,b)=>a.score-b.score)[0];
      return '<div class="daily-day-card"><div class="daily-day-head"><div><strong>'+d+'</strong><div class="muted">'+list.length+' กิจกรรม · เฉลี่ย '+avg+'%</div></div><span class="daily-grade">'+g+'</span></div><div class="daily-meter"><i style="width:'+avg+'%"></i></div><div class="alpha-stats">'+skills+'</div><div class="daily-advice"><b>'+gradeMeaning(g)+'.</b> '+escapeHTML(alphabetAdvice(lowest?.skill,lowest?.title))+'</div></div>';
    }).join('');
    panel.innerHTML='<h3>📅 ผลประเมินรายวันสำหรับผู้ปกครอง</h3><p class="muted">ดูคะแนน ทักษะที่ฝึก และข้อเสนอแนะต่อเนื่อง · ระดับ A–D เป็นเกณฑ์ติดตามในแอป</p><div class="daily-advice"><b>เกณฑ์คะแนน:</b> A 80–100% · B 70–79% · C 60–69% · D ต่ำกว่า 60%<br><span class="muted">ผลประเมินใช้คะแนนจากกิจกรรมที่ทำเสร็จในวันนั้น ไม่มีการเรียนจะแสดงว่าไม่มีข้อมูล ไม่คิดเป็นศูนย์</span></div>'+todayBlock+'<h4 style="margin:20px 0 8px">ประวัติ 7 วันที่มีกิจกรรมล่าสุด</h4>'+(recent||'<div class="empty">เมื่อเริ่มทำกิจกรรมแล้ว สรุปผลรายวันจะแสดงที่นี่</div>');
  }
  function alphaShuffle(list){const a=list.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function openAlphabetPractice(){alphaGame=null;window.showView('alphabetView');renderAlphabetHome()}
  window.openAlphabetPractice=openAlphabetPractice;
  function renderAlphabetHome(){
    const root=document.getElementById('alphabetView');if(!root)return;
    const p=child(),history=p.alphabetHistory||[],last=history[0],grade=Number(p.grade)||2;
    root.innerHTML='<div class="section-head"><div><h2>🔤 ตัวอักษรและสระ A–Z</h2><p>บทพื้นฐานสำหรับ ป.1–ป.3 · ป.4–ป.6 ใช้เล่นทบทวนได้</p></div><button class="secondary" onclick="showView(\'lessonsView\')">กลับบทเรียน</button></div><div class="alphabet-hero"><h2>'+(grade<=3?'ค่อย ๆ รู้จักตัวอักษรไปด้วยกัน':'เกมทบทวนตัวอักษรและสระ')+'</h2><p>ภาษาอังกฤษมี 26 ตัวอักษร สระมี 5 ตัว คือ A, E, I, O, U ตัวอื่นเป็นพยัญชนะ กดการ์ดเพื่อฟังชื่อ เสียงสระสั้น และตัวอย่างคำ</p>'+(last?'<p><b>ฝึกล่าสุด:</b> '+last.score+'% · '+last.correct+'/'+last.total+' ข้อ</p>':'')+'</div><div class="alphabet-modes"><button class="alphabet-mode" data-alpha-mode="find"><span>⌨️</span><b>หาตัวอักษรบนคีย์บอร์ด</b><small>มองตัวพิมพ์ใหญ่หรือเล็ก แล้วกดตัวที่ตรงกัน</small></button><button class="alphabet-mode" data-alpha-mode="match"><span>🔠</span><b>จับคู่ตัวพิมพ์ใหญ่–เล็ก</b><small>เห็น A แล้วเลือก a ให้ถูก</small></button><button class="alphabet-mode" data-alpha-mode="vowel"><span>🎵</span><b>แยกสระกับพยัญชนะ</b><small>ฝึกจำสระ 5 ตัวจากตัวอักษรทั้ง 26 ตัว</small></button></div><div class="panel"><div class="section-head" style="margin-top:0"><div><h3>ฟังและดูตัวอักษร</h3><p>แตะการ์ดเพื่อฟังชื่อและตัวอย่างคำ</p></div></div><div class="alphabet-grid">'+ALPHA.map(l=>'<button class="alphabet-card" type="button" data-alpha-say="'+l+'" aria-label="'+l.toUpperCase()+' '+l+'"><span class="upper">'+l.toUpperCase()+'</span><span class="lower">'+l+'</span><span class="alphabet-vowel-mark">'+(ALPHA_VOWELS.has(l)?'สระเสียง '+ALPHA_EXAMPLES[l][2]:ALPHA_NAMES[l])+'</span><small>'+ALPHA_EXAMPLES[l][0]+'</small></button>').join('')+'</div><p class="install-hint">สระเสียงสั้นตัวอย่าง: A–apple, E–egg, I–igloo, O–orange, U–umbrella</p></div>';
    root.querySelectorAll('[data-alpha-mode]').forEach(b=>b.onclick=()=>startAlphaGame(b.dataset.alphaMode));
    root.querySelectorAll('[data-alpha-say]').forEach(b=>b.onclick=()=>{const l=b.dataset.alphaSay,x=ALPHA_EXAMPLES[l];speak(l.toUpperCase()+'. '+x[0],.76,'en-US');b.classList.add('active');setTimeout(()=>b.classList.remove('active'),350)});
  }
  function startAlphaGame(mode){alphaGame={mode:mode,letters:alphaShuffle(ALPHA).slice(0,10),index:0,correct:0,streak:0,answered:false};window.showView('alphabetView');renderAlphaQuestion()}
  function alphaKeyboard(target){
    const rows=['qwertyuiop','asdfghjkl','zxcvbnm'];
    return '<div class="alpha-keyboard" aria-label="แป้นพิมพ์ตัวอักษรภาษาอังกฤษ">'+rows.map(row=>'<div class="alpha-key-row">'+Array.from(row).map(l=>{const shown=target===target.toUpperCase()?l.toUpperCase():l;return '<button type="button" class="alpha-key" data-alpha-answer="'+shown+'">'+shown+'</button>'}).join('')+'</div>').join('')+'</div>';
  }
  function renderAlphaQuestion(){
    const g=alphaGame,root=document.getElementById('alphabetView');if(!g||!root)return;
    if(g.index>=g.letters.length){finishAlphaGame();return}
    const l=g.letters[g.index],upper=l.toUpperCase(),x=ALPHA_EXAMPLES[l],progress='ข้อ '+(g.index+1)+' จาก '+g.letters.length;
    let prompt='',answers='';
    if(g.mode==='find'){const target=(g.index%2===0)?l:upper;prompt='แตะตัวอักษร <b>'+target+'</b> บนแป้นพิมพ์';answers=alphaKeyboard(target)}
    if(g.mode==='match'){prompt='ตัวพิมพ์เล็กที่คู่กับ <b>'+upper+'</b> คือข้อใด?';answers=alphaKeyboard(l)}
    if(g.mode==='vowel'){prompt='ตัวอักษร <b>'+upper+' '+l+'</b> เป็นอะไร?';answers='<div class="alpha-answer-options"><button class="alpha-answer" data-alpha-answer="vowel">🌟 สระ</button><button class="alpha-answer" data-alpha-answer="consonant">🧩 พยัญชนะ</button></div><p class="muted">ตัวอย่างคำ: '+x[0]+' · '+x[1]+'</p>'}
    root.innerHTML='<div class="section-head"><div><h2>🎮 '+ALPHA_MODE_LABEL[g.mode]+'</h2><p>'+progress+' · ตอบถูก '+g.correct+' ข้อ</p></div><button class="secondary" id="alphaQuit">กลับหน้าฝึก</button></div><div class="panel activity-card"><div class="alpha-stats"><span class="tag">⭐ '+g.correct+' คะแนน</span><span class="tag">🔥 ต่อเนื่อง '+g.streak+'</span><span class="tag">🌱 ทำผิดได้ ลองใหม่ได้</span></div><div class="alphabet-question"><span class="tag">'+(g.mode==='vowel'?'สระและพยัญชนะ':'ตัวอักษรภาษาอังกฤษ')+'</span><strong>'+prompt+'</strong>'+(g.mode==='find'||g.mode==='match'?'<p class="muted">ฟังชื่ออักษร: '+upper+' · '+x[0]+' ('+x[1]+')</p>':'')+'</div>'+answers+'<div class="alpha-feedback" id="alphaFeedback" aria-live="polite">เลือกคำตอบได้เลย 😊</div><div class="daily-advice">'+(g.mode==='vowel'?'สระภาษาอังกฤษมี 5 ตัว คือ A, E, I, O, U':'จำไว้: ตัวพิมพ์ใหญ่ <b>'+upper+'</b> และตัวพิมพ์เล็ก <b>'+l+'</b> เป็นตัวอักษรเดียวกัน'+(ALPHA_VOWELS.has(l)?' · ตัวนี้เป็นสระ':' · ตัวนี้เป็นพยัญชนะ'))+'</div></div>';
    document.getElementById('alphaQuit').onclick=openAlphabetPractice;
    root.querySelectorAll('[data-alpha-answer]').forEach(b=>b.onclick=()=>checkAlphaAnswer(b,b.dataset.alphaAnswer));
  }
  function checkAlphaAnswer(btn,value){
    const g=alphaGame;if(!g||g.answered)return;g.answered=true;
    const l=g.letters[g.index],right=g.mode==='vowel'?(ALPHA_VOWELS.has(l)?'vowel':'consonant'):(g.mode==='match'?l:(g.index%2===0?l:l.toUpperCase()));
    const correct=value===right;document.querySelectorAll('[data-alpha-answer]').forEach(b=>b.disabled=true);
    const fb=document.getElementById('alphaFeedback');
    if(correct){g.correct++;g.streak++;if(btn)btn.classList.add('correct');if(basePlayAnswerSound)basePlayAnswerSound(true);playAlphaSound(g.streak>=3?'streak':'correct');fb.className='alpha-feedback feedback good';fb.textContent=g.streak>=3?'ต่อเนื่อง '+g.streak+' ข้อแล้ว เก่งมาก! 🎉':'ถูกต้อง เก่งมาก! 🌟'}
    else{g.streak=0;if(btn)btn.classList.add('wrong');const rightBtn=[...document.querySelectorAll('[data-alpha-answer]')].find(b=>b.dataset.alphaAnswer===right);if(rightBtn)rightBtn.classList.add('correct');if(basePlayAnswerSound)basePlayAnswerSound(false);playAlphaSound('retry');fb.className='alpha-feedback feedback retry';fb.textContent='ตัวที่ถูกคือ '+(g.mode==='vowel'?(right==='vowel'?'สระ':'พยัญชนะ'):right)+' ไม่เป็นไร ลองข้อต่อไปนะ'}
    setTimeout(()=>{g.index++;g.answered=false;renderAlphaQuestion()},850);
  }
  function playAlphaSound(kind){
    if(!voiceEnabled)return;
    try{
      const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
      const ctx=new Audio(),notes=kind==='retry'?[330]:kind==='streak'?[523,659,784,988]:kind==='finish'?[523,659,784,1047]:[659,784];
      notes.forEach((hz,i)=>{const osc=ctx.createOscillator(),gain=ctx.createGain(),start=ctx.currentTime+i*.085;osc.type='sine';osc.frequency.value=hz;gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.11,start+.018);gain.gain.exponentialRampToValueAtTime(.0001,start+.16);osc.connect(gain);gain.connect(ctx.destination);osc.start(start);osc.stop(start+.18)});
      setTimeout(()=>ctx.close(),Math.max(500,notes.length*100+300));
    }catch(e){}
  }
  function finishAlphaGame(){
    const g=alphaGame,p=child(),score=Math.round(g.correct/g.letters.length*100),mode=g.mode;
    p.alphabetHistory=p.alphabetHistory||[];p.alphabetHistory.unshift({date:new Date().toISOString(),score:score,correct:g.correct,total:g.letters.length,skill:mode,title:ALPHA_MODE_LABEL[mode]});
    p.alphabetHistory=p.alphabetHistory.slice(0,120);const v=versionData();v.points=(v.points||0)+Math.floor(g.correct/2);persist();playAlphaSound('finish');
    const level=gradeForScore(score),advice=alphabetAdvice(mode,ALPHA_MODE_LABEL[mode]);
    document.getElementById('alphabetView').innerHTML='<div class="section-head"><div><h2>🏁 จบเกมแล้ว!</h2><p>'+ALPHA_MODE_LABEL[mode]+'</p></div></div><div class="panel" style="max-width:650px;margin:0 auto;text-align:center"><div style="font-size:64px">'+(score>=80?'🏆':'🌟')+'</div><h2>'+ (score>=80?'เยี่ยมมาก ทำได้คล่องแล้ว!':'เก่งมากที่ตั้งใจฝึก!')+'</h2><div class="daily-grade" style="margin:8px auto">'+level+'</div><p class="muted">ตอบถูก '+g.correct+' จาก '+g.letters.length+' ข้อ · '+score+'%</p><div class="daily-meter"><i style="width:'+score+'%"></i></div><div class="daily-advice"><b>แนะนำฝึกต่อ:</b> '+escapeHTML(advice)+'</div><div class="form-row" style="justify-content:center"><button class="primary" id="alphaAgain">เล่นอีกครั้ง</button><button class="secondary" id="alphaResults">ดูผลประเมิน</button><button class="secondary" id="alphaBack">กลับบทเรียน</button></div></div>';
    document.getElementById('alphaAgain').onclick=()=>startAlphaGame(mode);
    document.getElementById('alphaResults').onclick=()=>window.showView('progressView');
    document.getElementById('alphaBack').onclick=()=>window.showView('lessonsView');
    alphaGame=null;renderReport();
  }
  const baseRenderUnits=window.renderUnits;
  if(baseRenderUnits)window.renderUnits=function(){baseRenderUnits();const host=document.getElementById('alphabetEntry');if(!host)return;const grade=Number(child().grade)||2;host.innerHTML='<div class="alphabet-entry"><div class="alphabet-entry-icon">🔤</div><div><h3>'+(grade<=3?'บทพื้นฐาน: ตัวอักษรและสระ A–Z':'เกมทบทวน: ตัวอักษรและสระ A–Z')+'</h3><p>ฝึกตัวพิมพ์ใหญ่–เล็ก เสียงสระ และหาตัวอักษรบนคีย์บอร์ด · ใช้ได้ทุกชั้น ป.1–ป.6</p></div><button type="button" onclick="openAlphabetPractice()">เริ่มฝึก 🎮</button></div>'};
  const oldReport=window.renderReport;
  window.renderReport=function(){oldReport();const wrap=document.getElementById('reportSummary');if(wrap&&!document.getElementById('dailyStudyReport')){const row=document.createElement('div');row.className='report-row';row.id='dailyStudyReport';row.innerHTML='<span>เวลาเรียนวันนี้</span><b id="dailyStudyReportValue"></b>';wrap.appendChild(row)}const value=document.getElementById('dailyStudyReportValue');if(value)value.textContent=formatTime(secondsToday())+' / '+formatTime(goalSeconds())+' นาที';renderDailyAssessment()};
  document.addEventListener('visibilitychange',()=>{tickStudyTimer();lastTick=Date.now();renderDailyTimer()});
  window.addEventListener('pagehide',()=>{tickStudyTimer();persist()});
  ensureData();
  window.renderDailyTimer=renderDailyTimer;
  window.setInterval(tickStudyTimer,1000);
  renderDailyTimer();
  renderAll();
})();

