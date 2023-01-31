
# cheki-html

"cheki-html" is a CLI tool for converting Nunjucks + SCSS documents to PNG Images.

## DEMO

"cheki-html" and your [nunjucks + scss documents](https://github.com/m4k15y6666fk/cheki-html/blob/master/input/example.njk) can generate the images like:

<img width="33.3%" src="https://github.com/m4k15y6666fk/cheki-html/blob/master/example.png" alt="Example">

## Features

This tool was originally designed to generate images like chat apps' screenshots in the text-based and semi-automatic way.

Abstracting from that idea, this tool is now able to semi-automatically generate stylized images using nunjucks and scss.

## Requirements

* Node.js >= 18.12.1
* npm >= 8.19.2

```bash
node --version
# 19.5.0

npm --version
# 9.3.1
```

## Installation

You can install "cheki-html" with "npm" command:

```bash
npm install -g cheki-html
```

Or, you can install it locally:

```bash
cd <your-local-project>

npm install cheki-html
# then, you have to execute "cheki-html" with "npx" command;
# e.g.) npx cheki-html build
```

## Usage

"cheki-html" has 4 subcommands (help, init, preview, build), and each subcommand has their options.

```bash
cheki-html <subcommand> [options]
```

1. Preparing default template.

```bash
mkdir <empty-directory>
cd <empty-directory>

cheki-html init
```

2. Edit the template.

```bash
nano example.njk
# or add some html/nunjucks files (.html/.njk)

nano assets/css/chat.scss
# or add some css/scss/sass files (.css/.scss/.sass)
```

3. Preview your template.

```bash
cheki-html preview
```

Open your browser, and access `http://localhost:8080/preview`

4. Build your template.

```bash
cheki-html build
```

You can find the generated screenshots in the "output" directory.

## Note

I don't test under Linux and Windows.

## Author

* M4K-15Y-6666-FK

* [GitHub](https://github.com/m4k15y6666fk)
* [OFUSE](https://ofuse.me/m4k15y6666fk)

* [Email](mailto:m4k15y6666fk@outlook.com)

<!--
[Web](https://render.com)

[Miskey](https://miskey.io)

[Twitter](https://twitter.com)
-->

## Donate

[OFUSE](https://ofuse.me/m4k15y6666fk)

Here, you can send messages and view the progress of my works (not only programs; novel, music, or etc.)

Of course, you can just donate to me.

## License

"cheki-html" is under [MIT license](https://opensource.org/licenses/MIT).

Feel free to use the generated screenshots for your commercial projects !

But, be careful of the license of the images used in default template (e.g., when you use the images seperately from this program). See [input/assets/img/LICENSE](https://github.com/m4k15y6666fk/cheki-html/blob/master/input/assets/img/LICENSE)
