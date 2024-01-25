# Getting Started

This is a simple Next.js app that displays a list of Github repositories for a given user and/or organization.

It uses the Github API to fetch the repositories and display them in a table.

The app is deployed on Vercel and can be accessed at [https://apq-402312542423-tg-915-d.vercel.app/](https://apq-402312542423-tg-915-d.vercel.app/).

## Running the app locally
 
In order to run the app locally with higher Github API rate limits, 
you will need to create a `.env.local` file in the root directory of the project.
Set the correct value for the GITHUB_TOKEN environment variable in the `.env.local` file. 
Please see the `.env.local.example` file for an example.

Install the dependencies:

```bash
yarn install
```

Run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
