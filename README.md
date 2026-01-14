#  Baan Joy

โปรเจกต์นี้ถูกพัฒนาด้วย Next.js (Frontend) และ PocketBase (Backend)

---

## 1. Prerequisites (สิ่งที่ต้องมีก่อนเริ่ม)

เพื่อให้โปรเจกต์ทำงานได้อย่างสมบูรณ์ กรุณาตรวจสอบว่ามีซอฟต์แวร์ดังต่อไปนี้ติดตั้งอยู่:

* **Node.js:** แนะนำเวอร์ชัน LTS (พร้อม npm หรือ yarn)
* **Git:** สำหรับการโคลน Repository
* **PocketBase Binary:** ไฟล์ `pocketbase.exe` (หรือ Binary สำหรับ OS อื่นๆ) ต้องอยู่ใน Root Directory ของโปรเจกต์

---

## 2. Clone & Install (ติดตั้ง)

เปิด Terminal ในโฟลเดอร์ที่ต้องการ และรันคำสั่งตามลำดับ:

| # | คำสั่ง |

| **2.1** | `git clone https://github.com/honeylamon/DSSI-68.git BaanJoy`

| **2.2** | `cd BaanJoy` 

| **2.3** | `npm install` 

---

## 3. Database Setup & Running Servers 

### A. การรัน PocketBase Server (Backend)

**PocketBase Server ต้องรันอยู่ตลอดเวลาเพื่อให้ Frontend ดึงข้อมูลได้**

1.  **เปิด Terminal แยก (Terminal A):** ใน Root Directory ของโปรเจกต์ (`Baan Joy`).
2.  **รันเซิร์ฟเวอร์:** รันคำสั่ง PocketBase Binary:
    ```bash
    pocketbase serve 
    ```
    (สำหรับ Windows สามารถใช้ `pocketbase.exe serve` หรือ `./pocketbase serve` ถ้าอยู่ใน PowerShell)
3.  **ตรวจสอบ:** Server จะโหลดไฟล์ฐานข้อมูล `pb_data/data.db` ที่ถูก Clone มา ทำให้ **ข้อมูลทุกอย่างตรงกับเครื่องของผู้พัฒนา**

### B. การรัน Next.js Development Server (Frontend)

1.  **เปิด Terminal ที่สอง (Terminal B):** ใน Root Directory ของโปรเจกต์
2.  **รัน Next.js:** รันคำสั่ง:
    ```bash
    npm run dev
    ```

---

## 4. Verification (ตรวจสอบความสำเร็จ)

### 4.1 ตรวจสอบ Backend และข้อมูล

* **Admin UI:** เปิดเบราว์เซอร์และไปที่ **`http://127.0.0.1:8090/_/`**
* **ล็อกอิน:** ใช้บัญชีผู้ดูแลระบบที่ผู้พัฒนาตั้งค่าไว้:
    * **Username/Email:** [adnin@ubu.ac.th]
    * **Password:** [1234567890]

### 4.2 ตรวจสอบ Frontend

* **Frontend URL:** เปิดเบราว์เซอร์และไปที่ **`http://localhost:3000`**
* **ยืนยัน:** หน้าเว็บควรแสดงผลอย่างถูกต้องและสามารถดึงข้อมูลจาก PocketBase มาแสดงได้ทันที

---
