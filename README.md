# Library Management System

Multi-module monolithic architecture for library management system.
Built with **Java 21 + Spring Boot 3.2.0** (backend) and **React 18 + Vite 8 + TailwindCSS 3** (frontend).

## Project 

### Backend (Spring Boot Multi-Module)

### Frontend (React + Vite + TailwindCSS)

## Prerequisites

- Java 21 or higher
- Maven 3.6 or higher
- Node.js 18 or higher
- MySQL 8.0 or higher

## Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Build the project:
```bash
mvn clean install
```

3. Configure database in `library-api/src/main/resources/application-local.yml`:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/your_database_name
    username: your_username
    password: your_password
```

4. Run the application:
```bash
cd library-api
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

## Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Architecture Notes

- **Multi-Module Monolithic**: Logical separation of domains within a single application
- **Feature-Based Frontend**
- **Shared Layer**: Common utilities and configurations in `library-common` (backend) and `shared/` (frontend)
- **Dependency Management**: Maven manages backend dependencies, npm manages frontend dependencies

