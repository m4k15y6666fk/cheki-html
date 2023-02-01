
# cheki-html

"cheki-html" は、Nunjucks と SCSS で書かれたファイルを PNG 画像 に変換するツールです。

## 言語

* [日本語](https://github.com/m4k15y6666fk/cheki-html/blob/master/README-ja.md)
* [English](https://github.com/m4k15y6666fk/cheki-html#readme)

## サンプル

"cheki-html" と [Nunjucks と SCSS で書かれたファイル](https://github.com/m4k15y6666fk/cheki-html/blob/master/input/example.njk)  から以下のような画像が作れます:

<img width="33.3%" src="https://github.com/m4k15y6666fk/cheki-html/blob/master/example.png" alt="Example">

## 目的

このツールはもともと、チャットアプリのスクリーンショットを テキストベースな方法で・半自動で 生成できるように考えられました。

"cheki-html" はこのアイディアを抽象化し、Nunjucks と SCSS のテキストから定型化された画像を生成することができるようになりました。

## システム要件

* Node.js >= 18.12.1
* npm >= 8.19.2

```bash
node --version
# 19.5.0

npm --version
# 9.3.1
```

## インストール

"cheki-html" は "npm" コマンドを使ってインストールできます:

```bash
npm install -g cheki-html
```

または、ローカルプロジェクトにインストールすることもできます:

```bash
cd <your-local-project>

npm install cheki-html
# then, you have to execute "cheki-html" with "npx" command;
# e.g.) npx cheki-html build
```

## 使い方

"cheki-html" は ４つのサブコマンド (help, init, preview, build) と それらのオプションを使用します.

```bash
cheki-html <subcommand> [options]
```

1. デフォルトのテンプレートを用意する

```bash
mkdir <empty-directory>
cd <empty-directory>

cheki-html init
```

2. テンプレートを編集する

```bash
nano example.njk
# or add some html/nunjucks files (.html/.njk)

nano assets/css/chat.scss
# or add some css/scss/sass files (.css/.scss/.sass)
```

3. テンプレートをプレビューする

```bash
cheki-html preview
```

Open your browser, and access `http://localhost:8080/preview`

4. テンプレートを変換する

```bash
cheki-html build
```

"output" ディレクトリの中に画像が生成されます。

## 注意事項

Linux, Windows では動作のテストをしていません。

## 作者

* M4K-15Y-6666-FK

* [GitHub](https://github.com/m4k15y6666fk)
* [OFUSE](https://ofuse.me/m4k15y6666fk)

* [Email](mailto:m4k15y6666fk@outlook.com)

<!--
[Web](https://render.com)

[Miskey](https://miskey.io)

[Twitter](https://twitter.com)
-->

## 寄付

[OFUSE](https://ofuse.me/m4k15y6666fk)

メッセージを送ったり、作品の進捗を確認することができます。

もちろん、ただ寄付することもできます。

## ライセンス

"cheki-html" は [MIT license](https://opensource.org/licenses/MIT) のもとで公開されています。

ぜひ、生成した画像を商用プロジェクトにも利用してください！

ただし、テンプレートの中で使われる画像のライセンスには気をつけてください（特に、このプログラムとは分けて使用する時） 詳しくは [input/assets/img/LICENSE](https://github.com/m4k15y6666fk/cheki-html/blob/master/input/assets/img/LICENSE) を見てください。
