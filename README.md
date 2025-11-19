# FlowOS Mobile (Expo Router + React Native Paper)

A production-ready starter that runs on Android, iOS and Web. It features:
- JWT auth (token saved in SecureStore)
- Beautiful UI with React Native Paper
- Tabs: **Daily Plan**, **Tasks**, **Profile**
- Tasks: list/search, add, edit, delete, toggle complete
- React Query + Axios for API calls
- Expo Router v6 structure

## Quick start

```bash
# 1) unzip and cd flowos-mobile
npm i
# 2) Set API URL
#    Edit app.json -> expo.extra.API_URL to point to your FlowOS API (https://yourapp.azurewebsites.net/api)
# 3) start
npm start
```

## Expected backend endpoints

```
POST   /auth/login           { email, password } -> { token }
GET    /auth/me              -> { id, name, email }
GET    /tasks                [q] -> Task[]
GET    /tasks/:id            -> Task
POST   /tasks                -> create
PUT    /tasks/:id            -> update
DELETE /tasks/:id            -> delete
```

Set CORS on your API to allow Expo dev URLs and your production domain.
