import { Octokit } from "@octokit/rest";
import { DEFAULT_REPO_LIMIT, DEFAULT_REPO_PAGE } from "./constants";
import {
  GithubOrganizationRepositories,
  ListRepositoriesForOrgProps,
  SearchRepositoriesForOrganizationProps,
  UserType,
} from "@/services/types";

const octokit = new Octokit({
  auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN,
});

// We fetch user repositories, not organization repositories.
// The data we need might not be available in the organization repositories endpoint,
// e.g., https://api.github.com/orgs/octocat would return a 'Not found' message
// while https://api.github.com/users/octocat would return the data we need.
export const getRepositoriesForUser = async ({
  org,
  type = UserType.all,
  limit = DEFAULT_REPO_LIMIT,
  page = DEFAULT_REPO_PAGE,
}: ListRepositoriesForOrgProps) => {
  if (!Object.values(UserType).includes(type)) {
    throw new Error("Invalid repository type");
  }

  if (limit < 1) {
    throw new Error("Limit must be greater than 0");
  }

  if (page < 0) {
    throw new Error("Page must be greater than or equal to 0");
  }

  try {
    const response = await octokit.repos.listForUser({
      type,
      username: org,
      page,
      per_page: limit,
    });

    return response.data as GithubOrganizationRepositories;
  } catch (error) {
    throw error;
  }
};

export const getUser = async (org: string) => {
  try {
    const organization = await octokit.users.getByUsername({ username: org });

    return organization.data;
  } catch (error) {
    throw error;
  }
};

export const searchUsers = async (query: string) => {
  try {
    const response = await octokit.search.users({ q: query });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchRepositoriesForOrganization = async ({
  orgName,
  query,
  limit = DEFAULT_REPO_LIMIT,
  page = DEFAULT_REPO_PAGE,
}: SearchRepositoriesForOrganizationProps) => {
  try {
    let q = `org:${orgName}`;

    if (query) {
      q += ` ${query} `;
    }

    const response = await octokit.search.repos({
      q,
      page,
      per_page: limit,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};
