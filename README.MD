# School Management System API 🏫

A RESTful API for managing school assignments with role-based access control (Principal, Teacher, Student). Built with Node.js, Express, and MongoDB.

[![GitHub Actions](https://img.shields.io/github/actions/workflow/status/yourusername/school-management/tests.yml?label=Tests)](https://github.com/yourusername/school-management/actions)
[![Coverage](https://img.shields.io/codecov/c/github/yourusername/school-management)](https://codecov.io/gh/yourusername/school-management)
[![Docker](https://img.shields.io/docker/v/yourusername/school-management)](https://hub.docker.com/r/yourusername/school-management)

## Features 🔥

### Principal Role 👨🏫
- View all teachers
- View all submitted/graded assignments
- Regrade assignments
- Manage school resources

### Teacher Role 👩🏫
- List assignments submitted to them
- Grade submitted assignments
- Track student progress

### Student Role 👩🎓
- Create/edit draft assignments
- Submit assignments to teachers
- View assignment history
- Track grades

## Tech Stack 🛠️
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT, Role-based access control
- **Testing**: Postman

## Getting Started 🚀

### Prerequisites
- Node.js v18+
- MongoDB v6+
- npm v9+

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/school-management.git


   cd school-management

2. Install Dependencies:
   ```bash
   npm install
3. Create .env file:
    ```bash
    MONGODB_URI=mongodb://localhost:27017/school_db

    JWT_SECRET=your_jwt_secret_key

    PORT=3000
4. Start the server:
    ```bash
    npm start