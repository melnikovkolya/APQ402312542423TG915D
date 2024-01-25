import {
  GithubOrganizationRepositories,
  GithubUserSearch,
} from "@/services/types";

export const formatReposDataForTable = (
  repos: GithubOrganizationRepositories,
) =>
  repos.map(({ id, name, open_issues_count, stargazers_count }) => ({
    key: id,
    name: name,
    open_issues_count,
    stargazers_count,
  }));

export const generateTotalLabel = (
  total: number,
  filteredResultCount?: number,
  isRangeFilterApplied?: boolean,
) => {
  if (typeof filteredResultCount === "undefined") {
    return `Found ${total} item${total === 1 ? "" : "s"} in total`;
  }

  let label = `Found ${filteredResultCount} item${
    filteredResultCount === 1 ? "" : "s"
  }`;

  if (isRangeFilterApplied) {
    label += ` on current page`;
  }

  return label;
};

export const filterItemsByOpenIssuesCount = (
  items: any[],
  minOpenIssueCount?: number | null,
  maxOpenIssueCount?: number | null,
) =>
  items.filter((item) => {
    const hasMinOpenIssues = minOpenIssueCount
      ? item.open_issues_count >= minOpenIssueCount
      : true;
    const hasMaxOpenIssues = maxOpenIssueCount
      ? item.open_issues_count <= maxOpenIssueCount
      : true;

    return hasMinOpenIssues && hasMaxOpenIssues;
  });

export const formatAutocompleteOptions = (options?: GithubUserSearch) =>
  options?.items.map(({ login }) => ({
    value: login,
    label: login,
  }));
