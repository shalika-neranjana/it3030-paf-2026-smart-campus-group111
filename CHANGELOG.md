# Changelog

All notable changes to this project will be documented in this file.

---

## [v1.0.0] - 2026-04-26

### 🎉 Initial Release — Smart Campus Operations Hub

First release of the Smart Campus Management System built for the IT3030 Programming Applications and Frameworks module at SLIIT (2026).

---

### ✨ Features

#### Authentication & Authorization
- JWT-based secure login and registration
- Role-based access control: **Admin**, **Manager**, **Technician**, **User**

#### Facility & Asset Catalog
- Browse and manage campus rooms, labs, and equipment
- Asset catalog with detailed resource metadata

#### Resource Booking
- Book facilities with real-time conflict detection
- Multi-role approval flow (Admin / Manager approval)
- Booking history and status tracking

#### Maintenance & Incident Ticketing
- Submit maintenance and incident tickets with image uploads
- Technician assignment by admins/managers
- Ticket resolution workflow with prominent CTA
- Ticket creators can delete their own pending tickets
- `TicketResponse` DTO with resolved technician name and role

#### Inbox Messaging
- Internal messaging system between users
- Markdown-formatted message support

#### Real-time Notifications
- In-app notification support for bookings, tickets, and messages

#### Timetable
- Campus timetable page for schedule visibility

---

### 🛠 Tech Stack

| Layer    | Technology              |
|----------|------------------------|
| Backend  | Spring Boot 4, Java 25, Maven |
| Frontend | React 19 + Vite        |
| Database | MongoDB                |
| Auth     | JWT                    |

---

### 👥 Team — Group 111

| Student ID   | Name                          |
|-------------|-------------------------------|
| IT23547360  | Neranjana K.H.P.S             |
| IT23555976  | Senevirathne S.W.J.N          |
| IT23569140  | Samarakoon S.M.B.P            |
| IT23554290  | Rathnayaka M.R.M.K.D          |

---

### 🚀 Getting Started

See [README.md](README.md) for full setup and run instructions.

**Prerequisites:** JDK 25, Node.js 20+, MongoDB
