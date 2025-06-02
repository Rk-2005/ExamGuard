# 🛡️ ExamGuard

**A real-time online test monitoring platform to prevent cheating during exams.**

---

## 🧠 Overview

**ExamGuard** empowers educators to conduct secure online exams by enabling live student monitoring, tab‐switch detection, and automated scoring. It addresses the growing challenge of students accessing unauthorized resources mid‐exam, ensuring integrity and fairness.

---

## 🚀 Key Features

- 👨‍🏫 **Admin Dashboard**  
  - Create, edit, and delete tests  
  - Assign unique test codes to each exam  
  - View live student join statuses  

- 🎓 **Student Interface**  
  - Join exams using a unique code  
  - Receive questions in real time when the test starts  
  - Submit answers directly through the browser  

- 🧑‍💻 **Real‐time Monitoring**  
  - Built with Socket.IO for instant updates  
  - Track live student activity (connected/disconnected)  
  - Observe live test progress and status  

- 🛑 **Tab‐Switch Detection**  
  - Detect if a student switches away from the test window  
  - Increment a violation counter for each detected switch  
  - Display flag count on the admin dashboard for quick review  

- 🧾 **Live Student Data**  
  - Display student name, email, test status, and current violation count  
  - Identify suspicious behavior immediately  

- 📤 **Instant Question Distribution**  
  - Questions are pushed to all connected students the moment the admin starts the exam  
  - Ensures synchronized test experiences  

- 📊 **Auto‐Scoring System**  
  - Auto‐grade objective questions upon submission  
  - Store scores in PostgreSQL for record‐keeping and reporting  

---

## 🛠️ Tech Stack

| Layer               | Technology             |
| ------------------- | ---------------------- |
| **Frontend**        | React, Tailwind CSS, Socket.IO Client |
| **Backend**         | Node.js, Express.js, Prisma ORM         |
| **Database**        | PostgreSQL                           |
| **Real-time Comm.** | Socket.IO                            |
| **Authentication**  | JWT (JSON Web Tokens)              |

---

📡 Live Demo
A deployed demo is available at:
https://exam-guard-three.vercel.app/dashboard

If you find ExamGuard helpful, please give it a ⭐ on GitHub!
For any questions or feedback, open an issue or contact the maintainers directly via email:
kriplanira@rknec.edu
