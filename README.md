Recnet is a human-driven recommendation system for academic readings. This project is built with Next.js (React) and Firebase in Javascript, deployed with Vercel.

## Getting Started

First, create a `.env.local` file and put in the Firebase project credentials for local testing. Template can be found in `.env.local.example`.


Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on `http://localhost:3000/api/...`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

### Documentation
Node.js Server SDK: https://googleapis.dev/nodejs/firestore/latest/index.html

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Firebase Cloud Functions
Cloud function is used for scheduling email digest: `utils/cloud_functions`.

### Deploy Functions
```bash
firebase login
firebase deploy --only functions:myFunction
```

### Delete Function
```bash
firebase functions:delete myFunction
```

### Documentations
https://firebase.google.com/docs/extensions/official/firestore-send-email
https://firebase.google.com/docs/functions/schedule-functions?gen=2nd#node.js
https://firebase.google.com/docs/functions/manage-functions?gen=2nd

