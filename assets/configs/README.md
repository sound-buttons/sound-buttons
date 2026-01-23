# ![icon](https://github.com/sound-buttons/sound-buttons/blob/master/src/assets/img/favicon/favicon-32x32.png?raw=true) Sound Buttons Config - 聲音按鈕設定檔

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

此儲存庫存放 [Sound Buttons 聲音按鈕](https://sound-buttons.click) 網站的 JSON 設定資料，作為主前端專案 [sound-buttons](https://github.com/sound-buttons/sound-buttons) 的 git submodule 使用。

每位 VTuber 角色都有獨立的 JSON 設定檔，包含角色資訊與分類好的聲音按鈕資料。

## 📢 社群參與 - 無需程式能力也能貢獻

即使您不熟悉程式碼或 Git，也可以透過 GitHub Discussions 參與這個專案：

> [!IMPORTANT]  
> 新增角色需要配置 Azure Blob Storage 音檔存儲空間，此存儲空間僅由專案維護者 [@jim60105](https://github.com/jim60105) 管理。因此，所有新增角色的請求都必須透過 GitHub Discussions 討論串提出，以便維護者協助完成後續的基礎設施配置作業。

### 🆕 [新增角色請求](https://github.com/sound-buttons/sound-buttons_configs/discussions/2)

想要新增您喜愛的 VTuber 到 Sound Buttons？請在此討論串提供以下資料：

- 英文暱稱（用做網址）
- 正式全名
- 正面立繪、人設圖（至少 640×1024，透明 PNG）
- 主色碼、副色碼（主色用於按鈕底色，建議深色）
- 介紹短文
- 相關連結（YouTube、Twitch、Twitter 等）
- 自介音檔（可提供影片出處和秒數）

### ✏️ [內容刪修請求](https://github.com/sound-buttons/sound-buttons_configs/discussions/3)

如需刪除、修改現有內容，或對分類有建議，請在此討論串留言：

- 刪除錯誤上傳的按鈕
- 修正按鈕名稱或分類
- 回報內容問題
- 提出改進建議

## 📁 檔案結構

```text
sound-buttons_configs/
├── main.json              # 角色索引主檔
├── template.json          # 新角色範本
├── {角色名稱}.json         # 各角色設定檔
├── scripts/               # 工具腳本
│   └── sort-by-button-count.zsh
├── .github/workflows/     # CI/CD 工作流程
│   └── build.yml
└── LICENSE                # AGPLv3 授權
```

## 📋 資料結構

### main.json（角色索引）

```json
{
  "name": "角色英文 ID",
  "fullName": "顯示名稱",
  "fullConfigURL": "assets/configs/{角色}.json",
  "liveUpdateURL": "https://blob.sound-buttons.click/...",
  "imgSrc": ["立繪圖片網址"],
  "color": {
    "primary": "#主色碼",
    "secondary": "#副色碼"
  }
}
```

### 按鈕物件結構

```json
{
  "id": "UUID",
  "filename": "音檔名稱.webm",
  "text": {
    "zh-tw": "按鈕文字（正體中文）",
    "ja": "ボタンテキスト（日本語）"
  },
  "volume": 1,
  "source": {
    "videoId": "YouTube 影片 ID",
    "start": 0,
    "end": 10
  }
}
```

## 🔄 CI/CD 流程

當此儲存庫有更新時：

1. GitHub Actions 驗證 JSON 語法
2. 自動壓縮 JSON 檔案至 `minify` 分支
3. 觸發主前端專案重新建構部署

## 🔗 相關儲存庫

| 儲存庫 | 說明 |
| ------ | ---- |
| [sound-buttons](https://github.com/sound-buttons/sound-buttons) | 前端（Angular） |
| [sound-buttons_configs](https://github.com/sound-buttons/sound-buttons_configs) | 設定資料（本儲存庫） |
| [sound-buttons_upload-backend](https://github.com/sound-buttons/sound-buttons_upload-backend) | 後端（Azure Functions） |
| [worker-click-counter](https://github.com/sound-buttons/worker-click-counter) | 點擊計數器 |

## 📜 授權

### Code

<img src="https://github.com/sound-buttons/sound-buttons/raw/master/src/assets/img/AGPLv3_Logo.svg" alt="open graph" width="200" />

[GNU AFFERO GENERAL PUBLIC LICENSE Version 3](./LICENSE)

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

### 聲音與角色圖片

所有聲音和角色圖片的著作權歸原創作者所有，我們依據二次創作規範使用。

如需透過 DMCA 下架您的資料，請至[此處回報](https://github.com/sound-buttons/sound-buttons_configs/discussions/3)。

---

### Special Closed Source Authorization

I, 陳鈞, authorize the following organizations/projects to use this project in a closed-source manner in any projects I have participated in/cooperated on.

- [Suda Yoruka](https://github.com/Suda-Yoruka)
- [jim60105/UnfairSpinWheel](https://github.com/jim60105/UnfairSpinWheel)
