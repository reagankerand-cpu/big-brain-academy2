# BIG BRAIN ACADEMY: Frontend + Backend Starter

## What's included
- `index.html`: current school website frontend, including the lab-students hero picture.
- `server.js`: Node.js backend using built-in modules (no npm packages required).
- `data/applications.json`: created automatically to store application enquiries.
- `package.json`: start command.

## Run in Termux
1. Extract this ZIP into a folder.
2. Open Termux and `cd` into that folder.
3. Check Node.js is installed: `node --version`
4. Start the server: `npm start`
5. On the same phone, open `http://localhost:3000` in your browser.
6. Test the API at `http://localhost:3000/api/health`.

To let other devices on the same Wi-Fi open the site, use the phone's Wi-Fi IP address, e.g. `http://192.168.1.20:3000`, replacing the example with the actual IP shown in Android Wi-Fi settings. The phone and other devices must share a network that allows device-to-device connections.

## API endpoints
- `GET /api/health`: checks whether the backend is running.
- `GET /api/announcements`: returns starter announcements.
- `POST /api/applications`: saves an application enquiry. JSON fields: `name`, `guardian`, `phone`, optional `email`, and `grade`.

Example request body:
```json
{"name":"Sample Learner","guardian":"Sample Guardian","phone":"0712345678","email":"parent@example.com","grade":"Grade 7"}
```

## Prototype limitations
This backend stores enquiries in a local JSON file. It is suitable for a classroom/demo prototype, not real sensitive student records. Existing frontend login/dashboard controls may still use browser-side demo behavior; they are NOT made secure by adding this backend. Before real use, add a database, server-side authentication and role permissions, HTTPS, backups, rate limiting, and a privacy/security review. Do not store real passwords or sensitive learner data in the JSON file.
