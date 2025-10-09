This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### CI/CD with GitLab

This project includes GitLab CI/CD configuration for automatic deployment to Vercel.

#### Setup Instructions

1. **Generate Vercel Token:**

   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Navigate to Account Settings → Tokens
   - Create a new token and copy it

2. **Configure GitLab CI/CD Variables:**

   - Go to your GitLab project → Settings → CI/CD → Variables
   - Add the following variables:
     - `VERCEL_TOKEN`: Your Vercel token (from step 1)
     - `VERCEL_PROJECT_ID`: Your Vercel project ID (found in project settings or via `vercel project list`)
     - `VERCEL_ORG_ID`: (Optional) Only needed if deploying to a team account

3. **How it knows your Vercel account:**
   The CI/CD pipeline authenticates with Vercel using the `VERCEL_TOKEN` environment variable. This token is linked to your Vercel account and provides the necessary permissions to deploy your project. The `VERCEL_PROJECT_ID` tells Vercel which specific project to deploy to, and if you're part of multiple organizations, `VERCEL_ORG_ID` specifies which organization the project belongs to.

#### Pipeline Stages

- **build**: Installs dependencies and builds the application
- **deploy**: Deploys the built application to Vercel production

The pipeline automatically runs on pushes to the `main` branch and creates deployments at `https://your-project-name.vercel.app`.
