# Deployment Instructions for ArticuLITE

This document outlines the steps to deploy the ArticuLITE application using Vercel and GitHub Actions.

## Prerequisites

- A [GitHub](https://github.com/) account
- A [Vercel](https://vercel.com/) account
- Basic knowledge of Git and GitHub

## Initial Setup with Vercel

1. Push your code to a GitHub repository
2. Log in to your Vercel account
3. Click "Add New" > "Project"
4. Select your GitHub repository
5. Configure your project settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Click "Deploy"

## Setting Up Continuous Deployment

### 1. Get Vercel Deployment Tokens

1. In your Vercel dashboard, go to "Settings" > "Tokens"
2. Create a new token with "Full Access" permissions
3. Copy the token value - you will need it for GitHub secrets

### 2. Get Vercel Project and Organization IDs

1. In your Vercel dashboard, click on your project
2. Navigate to "Settings" > "General"
3. Scroll down to find your "Project ID" and copy it
4. Go to "Settings" > "General" at the organization level
5. Copy the "Organization ID"

### 3. Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to "Settings" > "Secrets and variables" > "Actions"
3. Add the following secrets:
   - `VERCEL_TOKEN`: Your Vercel token from step 1
   - `VERCEL_PROJECT_ID`: Your Project ID from step 2
   - `VERCEL_ORG_ID`: Your Organization ID from step 2

## Continuous Integration and Deployment

The repository contains a GitHub Actions workflow file in `.github/workflows/ci.yml` that will:

1. Build and test the application on every push to the `main` branch and on pull requests
2. Deploy to Vercel automatically when changes are pushed to the `main` branch

## Manual Deployment

If you prefer to deploy manually:

1. Install the Vercel CLI: `npm install -g vercel`
2. Log in to Vercel: `vercel login`
3. Deploy to production: `vercel --prod`

## Environment Variables

Make sure to configure the following environment variables in your Vercel project settings:

- `NODE_ENV`: Set to `production` for production builds
- Any API keys or credentials needed by your application

## Monitoring Deployments

- Monitor your deployments in the Vercel dashboard
- Check GitHub Actions workflow runs for build status and logs

---

*Note: Keep your deployment tokens and credentials secure. Never commit them to your repository.* 