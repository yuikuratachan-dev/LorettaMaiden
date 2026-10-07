/*:
 * @target MZ
 * @plugindesc ゲーム中に外部ページへのリンクを貼ります。（スイッチ57で操作ロック、クリックで解除）
 * @author くらむぼん
 *
 * @param description
 * @text 説明
 * @desc リンクと一緒に表示されるメッセージ。
 * @default Webサイトへのリンク
 *
 * @command link_on
 * @text リンクを表示
 * @desc 指定したURLのリンクを画面に表示します。
 *
 * @arg url
 * @text URL
 * @desc 開くリンクのURL
 * @type string
 *
 * @arg title
 * @text タイトル
 * @desc リンクのタイトル
 * @type string
 * @default リンク
 *
 * @command link_off
 * @text リンクを非表示
 * @desc 画面に表示されたリンクを削除します。
 */

(() => {
    "use strict";

    var parameters = PluginManager.parameters("HyperLink");
    var description = parameters["description"] || "Webサイトへのリンク";

    let linkElement = null; // MZ用のリンク管理変数
    let overlayElement = null; // 操作を無効化するためのオーバーレイ

    Graphics.printLink = function (url, title) {
        if (window.RPGAtsumaru && window.RPGAtsumaru.popups && window.RPGAtsumaru.popups.openLink) {
            window.RPGAtsumaru.popups.openLink(url);
            return;
        }

        Graphics.clearLink(); // 既存のリンクを削除

        // スイッチ57の状態を取得
        const isCenter = $gameSwitches.value(57); // true: 中央（操作不能） / false: 左下

        // **スイッチ57がオンなら操作を完全に無効化**
        if (isCenter) {
            overlayElement = document.createElement("div");
            overlayElement.style.position = "fixed";
            overlayElement.style.top = "0";
            overlayElement.style.left = "0";
            overlayElement.style.width = "100%";
            overlayElement.style.height = "100%";
            overlayElement.style.backgroundColor = "rgba(0, 0, 0, 0.5)"; // 半透明の黒
            overlayElement.style.zIndex = "9999"; // 最前面に表示
            overlayElement.style.pointerEvents = "auto"; // クリック・キー入力を無効化
            document.body.appendChild(overlayElement);

            // **ツクールの操作を完全にブロック**
            SceneManager.stop(); // ゲームループを停止
        }

        // HTML の <a> タグを作成
        linkElement = document.createElement("a");
        linkElement.href = url;
        linkElement.textContent = title;
        linkElement.target = "_blank";
        linkElement.rel = "noopener noreferrer"; // セキュリティ対策

        // CSSの適用
        linkElement.style.position = "fixed";
        linkElement.style.padding = "10px 20px";
        linkElement.style.background = "#ffffff";
        linkElement.style.color = "#0000ff";
        linkElement.style.fontSize = "18px";
        linkElement.style.borderRadius = "6px";
        linkElement.style.boxShadow = "2px 2px 5px rgba(0,0,0,0.3)";
        linkElement.style.zIndex = "10000"; // 最前面に表示
        linkElement.style.textDecoration = "none";
        linkElement.style.fontWeight = "bold";
        linkElement.style.textAlign = "center";
        linkElement.style.cursor = "pointer";
        linkElement.style.display = "inline-block";
        linkElement.style.pointerEvents = "auto"; // クリック可能

        // スイッチ57の状態によって位置を変更
        if (isCenter) {
            // **中央に配置（操作不能）**
            linkElement.style.top = "50%";
            linkElement.style.left = "50%";
            linkElement.style.transform = "translate(-50%, -50%)";
        } else {
            // 左下に配置
            linkElement.style.left = "20px";
            linkElement.style.bottom = "20px";
        }

        // **スイッチ57がオンの場合、クリック時に57をオフ、59をオン**
        linkElement.addEventListener("click", function () {
            if (isCenter) {
                $gameSwitches.setValue(57, false); // スイッチ57をオフ
                $gameSwitches.setValue(59, true);  // スイッチ59をオン
                Graphics.clearLink(); // リンクと操作ロックを削除
            }
        });

        document.body.appendChild(linkElement);
    };

    Graphics.clearLink = function () {
        if (linkElement) {
            document.body.removeChild(linkElement);
            linkElement = null;
        }
        if (overlayElement) {
            document.body.removeChild(overlayElement);
            overlayElement = null;
        }

        // **ツクールの操作を元に戻す**
        SceneManager.resume(); // ゲームループを再開
    };

	PluginManager.registerCommand("HyperLink", "link_on", args => {
		const url = args.url;
		let title = args.title || "リンク"; // デフォルトタイトルを設定
		console.log("リンクのタイトル:", title); // デバッグ用ログ
	
		if (url) {
			Graphics.printLink(url, title);
		} else {
			console.error("リンクのURLが指定されていません");
		}
	});
	

    PluginManager.registerCommand("HyperLink", "link_off", () => {
        Graphics.clearLink();
    });

})();
