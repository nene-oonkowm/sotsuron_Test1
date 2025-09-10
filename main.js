// main.js (timeline結合用)
const jsPsych = initJsPsych();

const timeline = [
  {
    type: jsPsychHtmlButtonResponse,
    stimulus: '実験を開始します',
    choices: ['OK']
  }
];

// 各フェーズを追加
timeline.push(intro1_2);
timeline.push(intro3_id);
timeline.push(intro4_);
timeline.push(createPractice(jsPsych));
//timeline.push(practice);
timeline.push(createSurvey(jsPsych));
timeline.push(outro);

// 実行
jsPsych.run(timeline);
