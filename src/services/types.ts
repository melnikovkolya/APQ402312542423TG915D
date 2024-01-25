import { Octokit } from "@octokit/rest";
import { GetResponseDataTypeFromEndpointMethod } from "@octokit/types";

const octokit = new Octokit();

export type GithubOrganizationRepositories =
  GetResponseDataTypeFromEndpointMethod<typeof octokit.repos.listForOrg>;

export type GithubUserSearch = GetResponseDataTypeFromEndpointMethod<
  typeof octokit.search.users
>;

export type GithubRepositorySearch = GetResponseDataTypeFromEndpointMethod<
  typeof octokit.search.repos
>;

export enum UserType {
  "all" = "all",
  "owner" = "owner",
  "member" = "member",
}

export interface ListRepositoriesForOrgProps {
  org: string;
  type?: UserType;
  limit?: number;
  page?: number;
}

export interface SearchRepositoriesForOrganizationProps {
  orgName: string;
  query?: string;
  limit?: number;
  page?: number;
}
