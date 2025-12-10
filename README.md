# Baan Joy 


1.  **PocketBase Server:**
    * ดาวน์โหลดและรัน PocketBase Server ใน Terminal แยก: `./pocketbase serve`
    
2.  **Node.js & npm/yarn:**
    * ตรวจสอบว่าคุณติดตั้ง Node.js  และ npm 

### 2.  Clone & Install (เริ่มต้นจับเวลา)

เปิด Terminal และรันคำสั่งตามลำดับ:

| # | คำสั่ง |
| :--- | :--- | :--- |
| **2.1** | `git clone <YOUR_REPO_URL> <FOLDER_NAME>` | โคลนโปรเจกต์ลงในโฟลเดอร์ที่กำหนด (เช่น `DSSI-68-project`) |
| **2.2** | `cd <FOLDER_NAME>` | ย้ายเข้าสู่โฟลเดอร์โปรเจกต์ |
| **2.3** | `npm install` ติดตั้ง Dependencies ทั้งหมด 

### 3. Run Development Server

เมื่อติดตั้ง Dependencies เสร็จแล้ว ให้รัน Next.js Server:

| # | คำสั่ง | คำอธิบาย |
| :--- | :--- | :--- |
| **3.1** | `npm run dev` | รัน Next.js Development Server |

---

### 4.  Verification (ตรวจสอบความสำเร็จ)

* **Frontend:** เปิดเบราว์เซอร์และไปที่ **`http://localhost:3000`**
* **Backend:** ตรวจสอบว่า PocketBase Server รันอยู่และเข้าถึง Admin UI ได้ที่ **`http://127.0.0.1:8090/_/`**

