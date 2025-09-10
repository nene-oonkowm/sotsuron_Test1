// survey.js
function createSurvey(jsPsych) {


  // 報酬生成
  function randn_bm() {
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }
  function generateNormalRewards(n = 10, mean = 500, sd = 200, min = 0, max = 1000) {
    let rewards = [];
    while(rewards.length < n) {
      let value = Math.round((randn_bm() * sd + mean) / 50) * 50;
      value = Math.max(min, Math.min(max, value));
      rewards.push(value);
    }
    return rewards;
  }
  var values = generateNormalRewards();
  var revealed = Array(10).fill(false); // 各選択肢の開示状態
  var choiceValues = values;
  var available = Array(10).fill(true); // 選択肢が消失したらfalse

  // エージェントの選択ロジック
  function agentDecisions() {
    let agentChoices = [];
    let agentDecisions = [];
    for(let agent=0; agent<9; agent++) {
      // 利用可能な選択肢のみから選ぶ
      let indices = choiceValues.map((v, i) => available[i] ? i : null).filter(i => i !== null);
      let choice = indices[Math.floor(Math.random() * indices.length)];
      agentChoices.push(choice);
      // 価値×0.1%で意思決定
      let prob = choiceValues[choice] /1000;
      let decision = Math.random() < prob ? 1 : 0; // 1=意思決定, 0=しない
      agentDecisions.push({choice, decision});
    }
    return agentDecisions;
  }

  // 選択肢表示
  function getChoiceTrial() {
    return {
      type: jsPsychHtmlButtonResponse,
      stimulus: `<p>${available.filter(a => a).length}個の報酬から選んでください。</p>`,
      choices: choiceValues
        .map((v, i) => available[i] ? (revealed[i] ? `選択${i+1}：${v}円` : `選択${i+1}`) : null)
        .filter(label => label !== null), // 消失した選択肢はボタン非表示
      on_finish: function(data){
        let visibleIndices = choiceValues.map((v, i) => available[i] ? i : null).filter(i => i !== null);
        let chosenIndex = visibleIndices[data.response];
        data.chosen = chosenIndex;
        revealed[chosenIndex] = true;
      }
    };
  }

  console.log("getChoiceTrial:", getChoiceTrial());

  // 意思決定＆エージェント競合判定
  var decisionTrial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function(){
      var last_choice = jsPsych.data.get().last(1).values()[0].response;
      var value = choiceValues[last_choice];
      let html = `<p>選択${last_choice+1} の価値は <b>${value}円</b> です。</p>`;
      html += `<div style="display:flex; gap:8px; justify-content:center; margin-bottom:16px;">`;
      for(let i=0; i<10; i++){
        if(!available[i]) continue; 
        html += `<button type="button" 
          style="
            padding:8px 16px;
            border:2px solid ${i === last_choice ? '#e91e63' : '#888'};
            background:${revealed[i] ? '#f8bbd0' : '#fff'};
            font-weight:${i === last_choice ? 'bold' : 'normal'};
            border-radius:6px;
            cursor:default;
            pointer-events:none;
          ">
          ${available[i] ? (revealed[i] ? `選択${i+1}：${choiceValues[i]}円` : `選択${i+1}`) : "消失"}
        </button>`;
      }
      html += `</div>`;
      html += `<p>この選択肢で意思決定しますか？</p>`;
      return html;       
    },
    choices: ["はい", "いいえ"],
    on_finish: function(data){
      data.decision = data.response; // 0=はい, 1=いいえ
    }
  };

  const waitTrial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function(){
      return `<p>他の参加者が意思決定をしています、そのままお待ちください。</p>
              <p id="countdown" style="font-size:2em;">30</p>`;
    },
    choices: "NO_KEYS",
    trial_duration: 30000, // 30秒
    on_load: function(){
      let timeLeft = 30;
      const countdownElem = document.getElementById('countdown');
      const timer = setInterval(() => {
        timeLeft--;
        if(countdownElem) countdownElem.textContent = timeLeft;
        if(timeLeft <= 0) clearInterval(timer);
      }, 1000);
    }
  };

  // 競合判定・獲得判定
  var resultTrial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function(){
      var last_data = jsPsych.data.get().last(2).values();
      var last_choice = last_data[0].chosen;
      var last_decision = last_data[1].decision;
      //if(last_decision !== 0) return "<p>次の画面へ進みます。</p>"; // 「いいえ」ならスキップ

      // エージェント意思決定
      let agents = agentDecisions();
      let agentWin = agents.some(a => a.choice === last_choice && a.decision === 1);
      
      // エージェントが意思決定した選択肢は消失
      if(agentWin){
        available[last_choice] = false; //
      }

      // 参加者が「いいえ」の場合
      if(last_decision !== 0) {
        return `<p>次の画面へ進みます。</p>`;
      }


      // 参加者が「はい」の場合
      let both_decided = agentWin;
      let winner = "player";
      if(both_decided){
        winner = Math.random() < 0.5 ? "player" : "agent";
      }

      // エージェントが獲得した場合は選択肢消失
      if(winner === "agent"){
        return `<p>残念！この選択肢は他の参加者に獲得されました。<br>再選択してください。</p>`;
      }else{
        return `<p>おめでとうございます！選択肢${last_choice+1}（${choiceValues[last_choice]}円）を獲得しました！</p>`;
      }
    },
    choices: ["次へ"],
    on_finish: function(data){
      // 何もしない
    }
  };

  // ループ（参加者が獲得できるまで繰り返し）
  var choiceLoop = {
    timeline: [ 
      getChoiceTrial(), // ←やはりここがエラーの原因？
      //function() { return getChoiceTrial(); }, だと情報更新するが、practice全体にエラーが発生する
      decisionTrial,
      waitTrial,
      resultTrial
    ],
    loop_function: function(data){
      var last_result = data.values().slice(-1)[0].stimulus;
      // 「おめでとうございます！」が含まれていれば終了
      return !last_result.includes("おめでとうございます！");
    }
  };

  // practiceフェーズ全体
  return {
    timeline: [
      choiceLoop,
      {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: "<p>意思決定が確定しました！<br>次の画面へ進みます。</p>"
      }
    ]
  };
}