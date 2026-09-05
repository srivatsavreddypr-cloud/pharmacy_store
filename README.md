# Pharmacy App

A full-stack pharmacy management app built with React, Vite, Express, MySQL, and a small Python-based disease prediction helper.

## What this project includes

- React frontend for customers and admins
- Express API server for auth, orders, medicines, analytics, and admin features
- MySQL database with auto-created tables and sample seed data
- OTP-based local login and password reset flow
- Disease prediction endpoint powered by a local Python script

## Prerequisites

Before running the project, make sure these are installed on your machine:

- Node.js 18 or later
- npm
- MySQL Server
- Python 3

## Project setup

Open a terminal in the project folder:

```powershell
cd D:\AsusTufA15\4thSem\DBMS_Project\pharmacy-app
```

Install the Node.js dependencies:

```powershell
npm install
```

## Environment setup

Create a `.env` file from the example file:

```powershell
Copy-Item .env.example .env
```

Update the values inside `.env` to match your local setup:

```env
PORT=4000
CLIENT_URL=http://localhost:5173
JWT_SECRET=development-secret
OTP_EXPIRY_MINUTES=10
DEV_EXPOSE_OTP=true
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=pharmacy_app
PYTHON_COMMAND=python
```

## MySQL setup

1. Start your MySQL server.
2. Make sure the MySQL user in `.env` has permission to create databases and tables.
3. The app will automatically:
   - create the `pharmacy_app` database if it does not exist
   - create the required tables
   - insert sample medicines, delivery partners, and vendors if the tables are empty

If you want to inspect the base schema manually, see [server/schema.sql](/D:/AsusTufA15/4thSem/DBMS_Project/pharmacy-app/server/schema.sql).

## How to run the project

Start both the frontend and backend together:

```powershell
npm run dev
```

This starts:

- Frontend on `http://localhost:5173`
- Backend API on `http://localhost:4000`

## Other useful commands

Run only the backend server:

```powershell
npm run server
```

Build the frontend for production:

```powershell
npm run build
```

Preview the production frontend build:

```powershell
npm run preview
```

Run ESLint:

```powershell
npm run lint
```

## Python disease prediction setup

The project includes a local Python script at `Disease-Prediction-from-Symptoms-master/predict_api.py`.

This feature is used by the backend when calling the disease prediction endpoints. The current script only uses Python standard library modules, so in the current version there is no extra `pip install` step required.

If your Python command is not `python`, update this value in `.env`:

```env
PYTHON_COMMAND=python
```

Examples:

- `PYTHON_COMMAND=python`
- `PYTHON_COMMAND=py`
- `PYTHON_COMMAND=python3`

## Default development behavior

- OTP values are included in API responses when `DEV_EXPOSE_OTP=true`
- Auth state is stored in the browser
- The backend watches for file changes during development
- The frontend reloads automatically through Vite

## Troubleshooting

### `npm install` fails

- Make sure Node.js and npm are installed correctly
- Check that you are inside `D:\AsusTufA15\4thSem\DBMS_Project\pharmacy-app`
- Delete `node_modules` and `package-lock.json` only if you intentionally want a clean reinstall, then run `npm install` again

### MySQL connection fails

- Confirm MySQL is running
- Verify `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, and `MYSQL_PASSWORD` in `.env`
- Make sure the configured MySQL user has permission to create the database

### Backend starts but disease prediction fails

- Confirm Python 3 is installed
- Check that `PYTHON_COMMAND` in `.env` points to a valid Python executable
- Make sure the `Disease-Prediction-from-Symptoms-master` folder is still present

## Quick start

If you just want the shortest setup flow:

```powershell
cd D:\AsusTufA15\4thSem\DBMS_Project\pharmacy-app
npm install
Copy-Item .env.example .env
npm run dev
```

After that, open [http://localhost:5173](http://localhost:5173).
