// intro.js

// Intro1_2 ウェルカム~実験開始画面
const intro1_2 = {
  type: jsPsychInstructions,
  pages: [
    //Intro1 ウェルカム＆待機画面
    `<div style="text-align:left">
      <h2>ご参加ありがとうございます</h2>
      <p>全員そろい次第実験を開始します。</p>
      <p>携帯電話の電源をお切りください。</p>
    </div>`,
    // Intro2 実験開始画面
    `<div style="text-align:left">
      <h2>これから実験を開始します</h2>
    </div>`
    
  ],
  
  show_clickable_nav: true,      // 次へ/戻るボタンを表示
  allow_backward: false,         // 戻るを禁止
  button_label_next: '次へ',     // ボタン文言
  button_label_previous: '戻る', // 使わないが一応
  //show_page_number: true         // ページ番号を表示
  // ※キーボードの左右矢印でも進めます（完全に無効化したい場合は別途対応が必要）
};

// Intro3 参加者ID入力
const intro3_id = {
  type: jsPsychSurveyText,
  questions: [
    {prompt: "参加者IDを入力してください", name: "ID"}
  ],
  button_label: "次へ"
};

const intro4_ = {
  type: jsPsychInstructions,
  pages: [
    //Intro4 実験上の注意
    `<div style="text-align:left">
      <h2>実験時の注意</h2>
      <ul>
        <li>本実験では、タブレットと前方のスクリーン（or 現在見ているPC画面）を使います。</li>
        <li>実験中は、実験スタッフおよび画面の指示に従ってください。</li>
        <li>実験中は、周りの人と相談したり、実験以外の作業をしたりしないでください。</li>
        <li>また、携帯電話の電源はお切りください。</li>
        <li>実験で得られたデータは統計的に処理され、学術目的以外に使用されることはありません。</li>
        <li>実験の報酬は、これから行う実験の結果によって決定されます。実験中に獲得したポイントが、報酬金額に計算され、あなたの実験報酬として実験終了後に支払われます。</li>
        <li>質問のある方は＿＿＿＿＿＿＿で、実験スタッフにお知らせください。</li>
      </ul>
    </div>`,
    // Intro5 実験概要説明
    `<div style="text-align:left">
      <h2>実験概要</h2>
      <p>参加者IDを入力してください</p>
      <p>所要時間は約10〜15分です。</p>
    </div>`
  ],
  
  show_clickable_nav: true,      // 次へ/戻るボタンを表示
  allow_backward: false,         // 戻るを禁止
  button_label_next: '次へ',     // ボタン文言
  button_label_previous: '戻る', // 使わないが一応
  //show_page_number: true         // ページ番号を表示
  // ※キーボードの左右矢印でも進めます（完全に無効化したい場合は別途対応が必要）
};