// practice.js
// ====== practice フェーズ ======
function createPractice(jsPsych) {

  // 練習用トライアルの作成----------------------------------------
  // 固定報酬
  var choiceValues = [550, 450, 350, 600, 500, 350, 650, 300, 700, 400];
  var revealed = Array(10).fill(false);
  var available = Array(10).fill(true);

//--------ROUND 1-------------------

  // 1ラウンド目（はい押せない）
  // 1ラウンド目：選択肢表示（カード型・2×5グリッド・クリック選択）
/*function getChoiceTrial1() {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `<p>練習1回目：${available.filter(a => a).length}個の報酬から選んでください。</p>
    <div id="card-grid" style="display:grid;grid-template-columns:repeat(5,1fr);grid-template-rows:repeat(2,1fr);gap:16px;justify-items:center;align-items:center;margin:24px 0;"></div>`,
    choices: choiceValues
      .map((v, i) => available[i]
        ? `<div style="
            width:120px;height:120px;
            display:flex;flex-direction:column;justify-content:center;align-items:center;
            border:2px solid #888;border-radius:12px;
            background:${revealed[i] ? '#f8bbd0' : '#fff'};
            font-size:1.1em;font-weight:${revealed[i] ? 'bold' : 'normal'};
            margin:0;box-sizing:border-box;">
            <span>選択${i+1}</span>
            <span style="font-size:1.3em; margin-top:8px; min-height:1em;">
              ${revealed[i] ? `${choiceValues[i]}円` : ""}
            </span>
          </div>`
        : null
      )
      .filter(label => label !== null),
    button_html: '<button class="jspsych-btn" style="margin:0;width:120px;height:120px;display:flex;flex-direction:column;justify-content:center;align-items:center;border:2px solid #fff;">%choice%</button>',
    on_load: function() {
      // ボタンをグリッド内に移動
      const grid = document.getElementById('card-grid');
      const btns = document.querySelectorAll('.jspsych-btn');
      btns.forEach(btn => grid.appendChild(btn));
    },
    on_finish: function(data){
      let visibleIndices = choiceValues.map((v, i) => available[i] ? i : null).filter(i => i !== null);
      let chosenIndex = visibleIndices[data.response];
      revealed[chosenIndex] = true;
      jsPsych.data.write({chosen: chosenIndex});
    }
  };
}*/
function getChoiceTrial1() {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `<p>練習1回目：${available.filter(a => a).length}個の報酬から選んでください。</p>
      <div id="card-grid" style="display:grid;grid-template-columns:repeat(5,1fr);grid-template-rows:repeat(2,1fr);gap:16px;justify-items:center;align-items:center;margin:24px 0;"></div>`,
    choices: choiceValues
      .map((v, i) => available[i]
        ? revealed[i]
          ? `選択${i+1}\n${v}円`
          : `選択${i+1}`
        : null
      )
      .filter(label => label !== null),
    button_html: '<button class="jspsych-btn" style="margin:0;width:120px;height:120px;display:flex;flex-direction:column;justify-content:center;align-items:center;border:2px solid #888;border-radius:12px;background:#fff;font-size:1.1em;"><span style="font-weight:bold;">%choice%</span></button>',
    on_load: function() {
      // ボタンをグリッド内に移動
      const grid = document.getElementById('card-grid');
      const btns = document.querySelectorAll('.jspsych-btn');
      btns.forEach(btn => grid.appendChild(btn));
    },
    on_finish: function(data){
      let visibleIndices = choiceValues.map((v, i) => available[i] ? i : null).filter(i => i !== null);
      let chosenIndex = visibleIndices[data.response];
      revealed[chosenIndex] = true;
      jsPsych.data.write({chosen: chosenIndex});
    }
  };
}

// 1ラウンド目：意思決定画面（カード型・2×5グリッド・はいボタン無効）
var decisionTrial1 = {
  type: jsPsychHtmlButtonResponse,
  stimulus: function(){
    var last_choice = jsPsych.data.get().last(1).values()[0].chosen;
    var value = choiceValues[last_choice];
    let html = `<p>選択${last_choice+1} の価値は <b>${value}円</b> です。</p>`;
    html += `<div style="display:grid;grid-template-columns:repeat(5,1fr);grid-template-rows:repeat(2,1fr);gap:16px;justify-items:center;align-items:center;margin:24px 0;">`;
    for(let i=0; i<10; i++){
      
      html += `
        <div
          style="
            width:120px;height:120px;
            display:flex;flex-direction:column;justify-content:center;align-items:center;
            border:2px solid ${i === last_choice ? '#e91e63' : '#888'};
            border-radius:12px;
            background:${revealed[i] ? '#f8bbd0' : '#fff'};
            font-size:1.1em;
            font-weight:${i === last_choice ? 'bold' : 'normal'};
            margin:0;
            box-sizing:border-box;
          "
        >
          <span>選択${i+1}</span>
          <span style="font-size:1.3em; margin-top:8px; min-height:1em;">
            ${revealed[i] ? `${choiceValues[i]}円` : ""}
          </span>
        </div>
      `;
    }
    html += `</div>`;
    html += `<p>この選択肢で意思決定しますか？</p>`;
    return html;
  },
  choices: ["はい", "いいえ"],
  button_html: [
    '<button class="jspsych-btn" disabled>%choice%</button>', // はいボタン無効
    '<button class="jspsych-btn">%choice%</button>'
  ],
  on_finish: function(data){
    data.decision = 1; // 強制的に「いいえ」
  }
};
  var resultTrial1 = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `<p>再選択してください。</p>`,
    choices: ["次へ"]
  };

//--------ROUND 2-------------------
  
  // 2ラウンド目（選択肢2つ消失、いいえ押せない、競合で獲得失敗）
  function getChoiceTrial2() {
    let remain = available.map((a, i) => a ? i : null).filter(i => i !== null);
    if(remain.length >= 2){
      // シャッフルして先頭2つを消失
      for(let i = remain.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [remain[i], remain[j]] = [remain[j], remain[i]];
      }
      available[remain[0]] = false;
      available[remain[1]] = false;
    }

    return {
      type: jsPsychHtmlButtonResponse,
      stimulus: `<p>練習2回目：${available.filter(a => a).length}個の報酬から選んでください。</p>`,
      choices: choiceValues
        .map((v, i) => available[i] ? (revealed[i] ? `選択${i+1}：${v}円` : `選択${i+1}`) : null)
        .filter(label => label !== null),
      on_finish: function(data){
        let visibleIndices = choiceValues.map((v, i) => available[i] ? i : null).filter(i => i !== null);
        let chosenIndex = visibleIndices[data.response];
        revealed[chosenIndex] = true;
        jsPsych.data.write({chosen: chosenIndex});
      }
    };
  }
  var decisionTrial2 = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function(){
      var last_choice = jsPsych.data.get().last(1).values()[0].chosen;
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
          ${revealed[i] ? `選択${i+1}：${choiceValues[i]}円` : `選択${i+1}`}
        </button>`;
      }
      html += `</div>`;
      html += `<p>この選択肢で意思決定しますか？</p>`;
      return html;
    },
    choices: ["はい", "いいえ"],
    button_html: [
      '<button class="jspsych-btn">%choice%</button>', // はいボタン有効
      '<button class="jspsych-btn" disabled>%choice%</button>' // いいえボタン無効
    ],
    on_finish: function(data){
      data.decision = 0; // 強制的に「はい」
    }
  };
  var resultTrial2 = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function(){
      // 競合で獲得失敗
      var last_choice = jsPsych.data.get().last(2).values()[0].chosen;
      available[last_choice] = false;
      return `<p>他のエージェントとの競合に負けました。再選択してください。</p>`;
    },
    choices: ["次へ"]
  };

//--------ROUND 3-------------------

  // 3ラウンド目（さらに1つ消失、獲得成功）
  function getChoiceTrial3() {
    // ラウンドに選択肢を１つ消失
    let remain = available.map((a, i) => a ? i : null).filter(i => i !== null);
    let randomIdx = remain[Math.floor(Math.random() * remain.length)];
    available[randomIdx] = false;

    return {
      type: jsPsychHtmlButtonResponse,
      stimulus: `<p>練習3回目：${available.filter(a => a).length}個の報酬から選んでください。</p>`,
      choices: choiceValues
        .map((v, i) => available[i] ? (revealed[i] ? `選択${i+1}：${v}円` : `選択${i+1}`) : null)
        .filter(label => label !== null),
      on_finish: function(data){
        let visibleIndices = choiceValues.map((v, i) => available[i] ? i : null).filter(i => i !== null);
        let chosenIndex = visibleIndices[data.response];
        revealed[chosenIndex] = true;
        jsPsych.data.write({chosen: chosenIndex});
      }
    };
  }
  var decisionTrial3 = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function(){
      var last_choice = jsPsych.data.get().last(1).values()[0].chosen;
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
          ${revealed[i] ? `選択${i+1}：${choiceValues[i]}円` : `選択${i+1}`}
        </button>`;
      }
      html += `</div>`;
      html += `<p>この選択肢で意思決定しますか？</p>`;
      return html;
    },
    choices: ["はい", "いいえ"],
    button_html: [
      '<button class="jspsych-btn">%choice%</button>', // 両方有効
      '<button class="jspsych-btn" disabled>%choice%</button>'
    ],
    on_finish: function(data){
      data.decision = 0; // 「はい」
    }
  };
  var resultTrial3 = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function(){
      var last_choice = jsPsych.data.get().last(2).values()[0].chosen;
      available[last_choice] = false;
      return `<p>おめでとうございます！選択肢${last_choice+1}（${choiceValues[last_choice]}円）を獲得しました！</p>`;
    },
    choices: ["次へ"]
  };

  // 練習フェーズ全体
  return {
    timeline: [
      getChoiceTrial1(),
      decisionTrial1,
      resultTrial1,
      getChoiceTrial2(),
      decisionTrial2,
      resultTrial2,
      getChoiceTrial3(),
      decisionTrial3,
      resultTrial3,
      {
        type: jsPsychHtmlButtonResponse,
        stimulus: "<p>練習が終了しました。<br>次の画面へ進みます。</p>",
        choices: ["次へ"]
      }
    ],
      
  };

}
  