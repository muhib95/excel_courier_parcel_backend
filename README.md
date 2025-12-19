# 📦 Courier Parcel Management System

A role-based parcel booking and delivery tracking platform with map integration, PDF/CSV reporting, and real-time status updates.

---

## 🔐 Demo Credentials

Use these credentials to log in for each role:

| Role     | Phone Number | Password |
|----------|--------------|----------|
| Customer | 01749958965  | 12345    |
| Agent    | 01749958965  | 12345    |
| Admin    | 01749958967  | 12345    |

---

## 🧩 Project Overview

This system supports three distinct user roles with separate dashboards and permissions:

### 👤 Customer
- Register/login to the platform
- Book new parcels
- View personal booking list
- Track parcel location on map (pickup to delivery)

### 🚚 Agent
- Login to view assigned parcels
- Update parcel delivery status (Picked, In Transit, Delivered, etc.)
- See optimized delivery route on the map

### 🛠️ Admin
- Login to view analytics dashboard
- View and manage all users and parcel bookings
- Assign parcels to agents
- Generate and download PDF and CSV reports

---

## 🛠️ Tech Stack

- **Frontend**: Next.js, Tailwind CSS, React Leaflet
- **Backend**: Express.js, MongoDB, Mongoose
- **Authentication**: JWT (Token-based)
- **Real-time**: Socket.io
- **Map Integration**: Leaflet + Leaflet Routing Machine
- **Reporting**: PDFKit, json2csv

---

## 🚀 Deployment

- **Frontend**: Deployed to [Vercel](https://excel-courier-parcel-frontend.vercel.app/)
- **Backend**: Deployed to [Render](https://excel-courier-parcel-backend-1.onrender.com/)
