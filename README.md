# ![icon](https://github.com/sound-buttons/sound-buttons/blob/master/src/assets/img/favicon/favicon-32x32.png?raw=true) Sound Buttons - 聲音按鈕

<p align="center">
  <img src="https://github.com/sound-buttons/.github/assets/16995691/e0851a90-9ef7-42b0-9c61-2f4b79c085a9" alt="open graph" width="500" />
</p>

<p align="center">
  此專案是一個 Vtuber 聲音按鈕網站的實作。<br>
  This project is a implementation of the Vtuber voice button website.
</p>

<p align="center">
  <a href="https://sound-buttons.click" target="_blank">https://sound-buttons.click</a>
</p>

專案特色在於線上的音檔投稿系統，提交表單後能自動剪輯 Youtube 音訊並生成按鈕。  
採用了資料分離式架構設計，使增修內容只需撰寫 JSON 設定檔即可。

前端使用 Angular，後端則採用 Azure Functions，音檔存放於 Azure Blob Storage。

---

The project features an online audio submission system, which automatically clips YouTube audio and generates buttons after submitting the upload form.  
It adopts a data separation architecture design, allowing content updates to be made by simply writing JSON configuration files.

Angular is used for the front-end, while Azure Functions are used for the back-end. The audio files are stored and hosted on Azure Blob Storage.

[![CodeFactor](https://www.codefactor.io/repository/github/sound-buttons/sound-buttons/badge?style=for-the-badge)](https://www.codefactor.io/repository/github/sound-buttons/sound-buttons)  
![Youtube](https://img.shields.io/static/v1?style=for-the-badge&message=YouTube&color=FF0000&logo=YouTube&logoColor=FFFFFF&label=) ![Azure Blob Storage](https://img.shields.io/static/v1?style=for-the-badge&message=Azure+Blob+Storage&color=0089D6&logo=Microsoft+Azure&logoColor=FFFFFF&label=) ![Angular](https://img.shields.io/static/v1?style=for-the-badge&message=Angular&color=DD0031&logo=Angular&logoColor=FFFFFF&label=) ![Azure Functions](https://img.shields.io/static/v1?style=for-the-badge&message=Azure+Functions&color=0062AD&logo=Azure+Functions&logoColor=FFFFFF&label=)

## 🌏  Open and Build in the Cloud 
Click any of the buttons below to start a new development environment to demo or contribute to the codebase without having to install anything on your machine:

[![Open in VS Code](https://img.shields.io/badge/Open%20in-VS%20Code-blue?logo=visualstudiocode)](https://vscode.dev/github/sound-buttons/sound-buttons)
[![Open in Glitch](https://img.shields.io/badge/Open%20in-Glitch-blue?logo=glitch)](https://glitch.com/edit/#!/import/github/sound-buttons/sound-buttons)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/sound-buttons/sound-buttons)
[![Edit in Codesandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/sound-buttons/sound-buttons)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/sound-buttons/sound-buttons)
[![Open in Repl.it](https://replit.com/badge/github/withastro/astro)](https://replit.com/github/sound-buttons/sound-buttons)
[![Open in Codeanywhere](https://codeanywhere.com/img/open-in-codeanywhere-btn.svg)](https://app.codeanywhere.com/#https://github.com/sound-buttons/sound-buttons)
[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/sound-buttons/sound-buttons)

or

```bash
npm install -g @angular/cli

git clone --recurse-submodules https://github.com/sound-buttons/sound-buttons.git
npm install
npm run-script start
```

## Related Repos

|                                   |                                                                 |                                                                                                                                                                                                                                                 |
| --------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend (Angular)                | <https://github.com/sound-buttons/sound-buttons>                | [![CodeQL](https://github.com/sound-buttons/sound-buttons/actions/workflows/codeql.yml/badge.svg)](https://github.com/sound-buttons/sound-buttons/actions/workflows/codeql.yml)                                                                 |
| Data (JSON)                       | <https://github.com/sound-buttons/sound-buttons_configs>        |                                                                                                                                                                                                                                                 |
| Backend (Azure Function)          | <https://github.com/sound-buttons/sound-buttons_upload-backend> | [![CodeQL](https://github.com/sound-buttons/sound-buttons_upload-backend/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/sound-buttons/sound-buttons_upload-backend/actions/workflows/github-code-scanning/codeql) |
| Click counter (Cloudflare Worker) | <https://github.com/sound-buttons/worker-click-counter>         | [![CodeQL](https://github.com/sound-buttons/worker-click-counter/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/sound-buttons/worker-click-counter/actions/workflows/github-code-scanning/codeql)                 |

## Preview

### Home page

![1](https://github.com/sound-buttons/.github/assets/16995691/55f30f0d-df58-4bd8-b3b1-bd073eb2c1be)

### Buttons page, Table of contents, Audio control

![main](https://github.com/sound-buttons/sound-buttons/assets/16995691/235cfe85-8671-49b3-be93-07737b9c8828)

### Expandable introduction block

![2](https://github.com/sound-buttons/.github/assets/16995691/e180806b-799d-4e2e-ba21-a32ac69fe36a)

### Typeahead Search bar

![search](https://github.com/sound-buttons/sound-buttons/assets/16995691/01e6f648-0765-4933-bd96-56f02745645f)

### Upload form

![3](https://github.com/sound-buttons/.github/assets/16995691/814760ca-efd4-4899-881a-e106674fe6c8)

### i18n (Chinese, Japanese)

![upload2](https://github.com/sound-buttons/sound-buttons/assets/16995691/3bdb09a2-30a1-40bf-9a8d-e7f535ab2c16)

## Blog post introduction

<https://blog.maki0419.com/2021/05/soundbuttons.html>

## License

### Code

<img src="https://github.com/sound-buttons/sound-buttons/raw/master/src/assets/img/AGPLv3_Logo.svg" alt="open graph" width="200" />

[GNU AFFERO GENERAL PUBLIC LICENSE Version 3](./LICENSE)

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

### Sound and Character Pictures

The original artists hold the copyrights to all the sounds and character pictures. We have utilized them in accordance with their Derivative Works Guidelines (Secondary Creation Guidelines).

In case you wish to remove your data through a DMCA Takedown, kindly report it [here](https://github.com/sound-buttons/sound-buttons_configs/discussions/3).
