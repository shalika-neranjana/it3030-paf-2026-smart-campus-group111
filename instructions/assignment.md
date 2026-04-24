## IT3030 – PAF Assignment 2026 (Semester 1)

**Faculty of Computing – SLIIT**
**Programming Applications and Frameworks (IT3030)** 

---

## Important Details

* **Weight:** 30% of the final mark
* **Mode:** Group work (individual assessment; marks may differ)
* **Release Date:** 24th March 2026
* **Viva / Demonstration:** Starting 11th April 2026 (TBA)
* **Submission Deadline:** 11:45 PM (GMT +5:30), 27th April 2026 via Courseweb
* **Required Stack:** Spring Boot REST API + React client web application
* **Version Control:** GitHub repository + GitHub Actions workflow required

---

## Assignment Description

Develop a **production-inspired web system** for a real-world business scenario.

### Required Deliverables

* **Java (Spring Boot) REST API**

  * Layered architecture
  * Validation
  * Error handling
  * Security
* **React-based client web application**

  * Consumes API
  * Provides usable UI

---

## Business Scenario: Smart Campus Operations Hub

A university requires a **single platform** to manage:

* Facility and asset bookings (rooms, labs, equipment)
* Maintenance and incident handling (fault reports, technician updates)

### System Requirements

* Clear workflow
* Role-based access
* Strong auditability

---

## Core Features (Minimum Requirements)

### Module A – Facilities & Assets Catalogue

* Maintain catalogue of:

  * Lecture halls
  * Labs
  * Meeting rooms
  * Equipment (projectors, cameras, etc.)
* Resource metadata:

  * Type
  * Capacity
  * Location
  * Availability windows
  * Status (ACTIVE / OUT_OF_SERVICE)
* Search and filtering support

---

### Module B – Booking Management

* Users can request bookings with:

  * Date
  * Time range
  * Purpose
  * Expected attendees
* Workflow:

  * `PENDING → APPROVED / REJECTED → CANCELLED`
* Prevent scheduling conflicts
* Admin capabilities:

  * Approve / reject with reason
* Views:

  * Users: own bookings
  * Admin: all bookings (with filters)

---

### Module C – Maintenance & Incident Ticketing

* Create tickets with:

  * Category
  * Description
  * Priority
  * Contact details
* Attachments:

  * Up to 3 images
* Workflow:

  * `OPEN → IN_PROGRESS → RESOLVED → CLOSED`
  * Admin can set `REJECTED`
* Features:

  * Assign technician
  * Add resolution notes
  * Comment system with ownership rules

---

### Module D – Notifications

* Notify users for:

  * Booking updates
  * Ticket status changes
  * New comments
* Accessible via UI (notification panel)

---

### Module E – Authentication & Authorization

* OAuth 2.0 login (e.g., Google)
* Roles:

  * USER
  * ADMIN
  * Optional: TECHNICIAN / MANAGER
* Role-based access control (backend + frontend)

---

## Assignment Tasks

* **Requirements Engineering**

  * Functional + non-functional requirements
* **Architecture Design**

  * System architecture diagram
  * API + frontend architecture
* **Implementation**

  * Spring Boot + React system
* **Testing & Quality**

  * Unit/integration tests or Postman collections
* **Version Control & CI**

  * GitHub + GitHub Actions (build & test)

---

## Other Requirements

* Active Git commit history required
* Each member must implement:

  * **At least 4 REST endpoints**
  * Using: GET, POST, PUT/PATCH, DELETE
* Use:

  * Proper HTTP status codes
  * Consistent API naming
* Database required (SQL or NoSQL)
* Apply security best practices
* Maintain strong UI/UX quality

---

## Recommended Work Allocation

* **Member 1:** Facilities & resource management
* **Member 2:** Booking workflow + conflict handling
* **Member 3:** Incident tickets + attachments
* **Member 4:** Notifications + OAuth + roles

---

## Submission Artifacts

* **GitHub Repository**

  * Public or accessible
  * Includes README with setup steps
* **Final Report (PDF)**

  * Requirements
  * Architecture diagrams
  * Endpoints
  * Testing evidence
  * Contribution summary
* **Running System**

  * Must run locally
* **Evidence**

  * Screenshots or video
  * OAuth login proof

---

## Naming Conventions

* **Report:** `IT3030_PAF_Assignment_2026_GroupXX.pdf`
* **Repository:** `it3030-paf-2026-smart-campus-groupXX`
* Exclude compiled files (`node_modules`, `target`)

---

## Optional Enhancements

* QR code check-in
* Admin analytics dashboard
* Ticket SLA tracking
* Notification preferences