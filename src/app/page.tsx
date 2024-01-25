"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getUser,
  getRepositoriesForUser,
  searchRepositoriesForOrganization,
  searchUsers,
} from "@/services/githubApi";
import { RequestError } from "@octokit/request-error";
import { useForm } from "react-hook-form";
import {
  GithubOrganizationRepositories,
  GithubRepositorySearch,
  GithubUserSearch,
} from "@/services/types";
import { AutoComplete, Button, Spin, Typography } from "antd";
import { useDebounce } from "@uidotdev/usehooks";
import {
  DEBOUNCE_TIMEOUT_MS,
  GITHUB_ORG_REPO_TABLE_COLUMNS,
} from "@/app/constants";
import { DEFAULT_REPO_LIMIT, DEFAULT_REPO_PAGE } from "@/services/constants";
import {
  FreqFormField,
  FreqInput,
  FreqInputNumber,
  FreqTable,
} from "@/components";
import {
  filterItemsByOpenIssuesCount,
  formatAutocompleteOptions,
  formatReposDataForTable,
  generateTotalLabel,
} from "@/app/utils";
import styles from "./page.module.css";
import { usePrevious } from "@/hooks";

enum RepoFilterFields {
  repoQuery = "repoQuery",
  minRepoIssue = "minRepoIssue",
  maxRepoIssue = "maxRepoIssue",
}

export default function Home() {
  const [error, setError] = useState("");
  const [validityError, setValidityError] = useState("");

  const [isFetchingOrganizations, setIsFetchingOrganizations] = useState(false);
  const [isFetchingRepositories, setIsFetchingRepositories] = useState(false);
  const [organizationQuery, setOrganizationQuery] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [page, setPage] = useState(DEFAULT_REPO_PAGE);
  const [organizationsFound, setOrganizationsFound] =
    useState<GithubUserSearch>();
  const [organizationPublicReposTotal, setOrganizationPublicReposTotal] =
    useState(0);

  const [organizationRepositories, setOrganizationRepositories] =
    useState<GithubOrganizationRepositories>([]);
  const [
    filteredOrganizationRepositories,
    setFilteredOrganizationRepositories,
  ] = useState<GithubRepositorySearch>();

  const { watch, control, setValue } = useForm({
    defaultValues: {
      repoQuery: "",
      minRepoIssue: null,
      maxRepoIssue: null,
    },
  });

  const repoQuery = watch(RepoFilterFields.repoQuery);
  const minOpenIssueCount = watch(RepoFilterFields.minRepoIssue);
  const maxOpenIssueCount = watch(RepoFilterFields.maxRepoIssue);

  const organizationQueryDebounced = useDebounce(
    organizationQuery,
    DEBOUNCE_TIMEOUT_MS,
  );

  const repoFilterQueryDebounced = useDebounce(repoQuery, DEBOUNCE_TIMEOUT_MS);

  const minOpenIssueCountDebounced = useDebounce(
    minOpenIssueCount,
    DEBOUNCE_TIMEOUT_MS,
  );

  const maxOpenIssueCountDebounced = useDebounce(
    maxOpenIssueCount,
    DEBOUNCE_TIMEOUT_MS,
  );

  const previousOrganizationQueryDebounced = usePrevious(
    organizationQueryDebounced,
  );
  const previousRepoFilterQueryDebounced = usePrevious(
    repoFilterQueryDebounced,
  );

  // fetch the list of organizations matching the query
  useEffect(() => {
    (async () => {
      setError("");

      if (!organizationQueryDebounced) {
        return setOrganizationsFound(undefined);
      }

      setIsFetchingOrganizations(true);

      try {
        if (previousRepoFilterQueryDebounced !== repoFilterQueryDebounced) {
          setPage(DEFAULT_REPO_PAGE);
        }

        const users = await searchUsers(organizationQueryDebounced);

        setOrganizationsFound(users);
      } catch (error) {
        if (error instanceof RequestError) {
          setError(error.message);
        } else {
          setError("");
          // capture unexpected errors otherwise
          throw error;
        }
      } finally {
        setIsFetchingOrganizations(false);
      }
    })();
  }, [organizationQueryDebounced]);

  useEffect(() => {
    if (previousOrganizationQueryDebounced !== organizationQueryDebounced) {
      setPage(DEFAULT_REPO_PAGE);
    }
  }, [organizationQueryDebounced]);

  const isFiltersApplied = useMemo(
    () =>
      Boolean(
        minOpenIssueCountDebounced ||
          maxOpenIssueCountDebounced ||
          repoFilterQueryDebounced,
      ),
    [
      minOpenIssueCountDebounced,
      maxOpenIssueCountDebounced,
      repoFilterQueryDebounced,
    ],
  );

  // fetch list of repositories for the selected organization
  useEffect(() => {
    (async () => {
      setError("");
      // setOrganizationRepositories([]);

      if (!selectedOrganization) {
        return;
      }

      setIsFetchingRepositories(true);

      if (!isFiltersApplied) {
        setFilteredOrganizationRepositories(undefined);

        try {
          const organizationMetadata = await getUser(selectedOrganization);

          setOrganizationPublicReposTotal(
            organizationMetadata.public_repos || 0,
          );

          const reposList = await getRepositoriesForUser({
            org: selectedOrganization,
            page,
          });

          setOrganizationRepositories(reposList);
        } catch (error) {
          if (error instanceof RequestError) {
            if (error.status === 404) {
              return setOrganizationPublicReposTotal(0);
            }
            setError(error.message);
          } else {
            setError("");
            // capture unexpected errors otherwise
            throw error;
          }
        } finally {
          setIsFetchingRepositories(false);
        }
      }

      setIsFetchingRepositories(false);
    })();
  }, [
    selectedOrganization,
    page,
    repoFilterQueryDebounced,
    minOpenIssueCountDebounced,
    maxOpenIssueCountDebounced,
  ]);

  // filter repositories for selected organization by repo name and open issues count range
  useEffect(() => {
    (async () => {
      if (!isMinMaxRelationValid) {
        return setValidityError("Min should be less than max");
      }

      setValidityError("");

      if (selectedOrganization && isFiltersApplied) {
        setIsFetchingRepositories(true);

        let queryPage = page;

        try {
          // reset the page number when the repo name filters are changed
          if (previousRepoFilterQueryDebounced !== repoFilterQueryDebounced) {
            queryPage = DEFAULT_REPO_PAGE;
            setPage(DEFAULT_REPO_PAGE);
          }

          const results = await searchRepositoriesForOrganization({
            orgName: selectedOrganization,
            query: repoFilterQueryDebounced,
            page: queryPage,
          });

          // NOTE: As discussed with the team, the `q` query param does not work for filtering by open issues count.
          // This seems to be the limitation on the Github API side.
          // We are filtering the results on the client side instead.
          // PS: Since filtering is done on the client side, the results are for the current page only.
          if (minOpenIssueCountDebounced || maxOpenIssueCountDebounced) {
            const filteredItems = filterItemsByOpenIssuesCount(
              repoFilterQueryDebounced
                ? results.items
                : organizationRepositories,
              minOpenIssueCountDebounced,
              maxOpenIssueCountDebounced,
            );

            setFilteredOrganizationRepositories({
              ...results,
              items: filteredItems,
              total_count: filteredItems.length,
            });

            return setOrganizationPublicReposTotal(filteredItems.length);
          }

          setFilteredOrganizationRepositories(results);

          return setOrganizationPublicReposTotal(results.total_count);
        } catch (error) {
          if (error instanceof RequestError) {
            setError(error.message);
          } else {
            setError("");
            // capture unexpected errors otherwise
            throw error;
          }
        } finally {
          setIsFetchingRepositories(false);
        }
      }
    })();
  }, [
    selectedOrganization,
    repoFilterQueryDebounced,
    minOpenIssueCountDebounced,
    maxOpenIssueCountDebounced,
    page,
  ]);

  const handleOrganizationSelect = (value: string) =>
    setSelectedOrganization(value);

  const handleOrganizationSearch = (value: string) => {
    setSelectedOrganization("");
    setOrganizationQuery(value);
  };

  const handleRetryFetch = () => {
    setError("");
    setPage(DEFAULT_REPO_PAGE);
  };

  const handleTablePageChange = (page: number) => setPage(page);

  const isReposResultsAvailable = useMemo(
    () => !error && selectedOrganization,
    [error, selectedOrganization],
  );

  const autocompleteOptions = useMemo(
    () => formatAutocompleteOptions(organizationsFound),
    [organizationsFound],
  );

  const isMinMaxRelationValid = useMemo(() => {
    if (
      minOpenIssueCountDebounced === null ||
      maxOpenIssueCountDebounced === null
    ) {
      return true;
    }

    return minOpenIssueCountDebounced < maxOpenIssueCountDebounced;
  }, [minOpenIssueCountDebounced, maxOpenIssueCountDebounced]);

  const dataSource = useMemo(() => {
    if (isFiltersApplied && filteredOrganizationRepositories) {
      return formatReposDataForTable(
        filteredOrganizationRepositories?.items as GithubOrganizationRepositories,
      );
    }

    return formatReposDataForTable(organizationRepositories);
  }, [
    repoFilterQueryDebounced,
    organizationRepositories,
    filteredOrganizationRepositories,
  ]);

  const showTotalLabel = useCallback(
    (total: number) => {
      const filteredResultCount = filteredOrganizationRepositories?.total_count;

      const isRangeFilterApplied = Boolean(
        minOpenIssueCountDebounced || maxOpenIssueCountDebounced,
      );

      return generateTotalLabel(
        total,
        filteredResultCount,
        isRangeFilterApplied,
      );
    },
    [
      filteredOrganizationRepositories,
      minOpenIssueCountDebounced,
      maxOpenIssueCountDebounced,
    ],
  );

  return (
    <main className={styles.main}>
      <div className={styles.topContainer}>
        <h2 className={styles.header}>Github organization repositories</h2>
        <div className={styles.searchContainer}>
          <AutoComplete
            options={autocompleteOptions}
            className={styles.searchInput}
            searchValue={organizationQuery}
            onSelect={handleOrganizationSelect}
            onSearch={handleOrganizationSearch}
            placeholder="Please start typing organization name"
            autoFocus
          />
          {isFetchingOrganizations && (
            <div>
              <Spin />
            </div>
          )}
        </div>
        {isReposResultsAvailable && (
          <>
            <div className={styles.filtersContainer}>
              <FreqFormField
                control={control}
                name={RepoFilterFields.repoQuery}
              >
                <FreqInput
                  label="Find a repository"
                  placeholder="Filter by name"
                />
              </FreqFormField>

              <div className={styles.issuesRangeContainer}>
                <FreqFormField
                  control={control}
                  name={RepoFilterFields.minRepoIssue}
                  error={validityError}
                >
                  <FreqInputNumber
                    label="Min open issues"
                    placeholder="Minimum"
                    value={minOpenIssueCount}
                  />
                </FreqFormField>
                <FreqFormField
                  control={control}
                  name={RepoFilterFields.maxRepoIssue}
                >
                  <FreqInputNumber
                    label="Max open issues"
                    placeholder="Maximum"
                    value={maxOpenIssueCount}
                  />
                </FreqFormField>
              </div>
            </div>
            <div className={styles.resultsContainer}>
              <FreqTable
                dataSource={dataSource}
                total={organizationPublicReposTotal}
                columns={GITHUB_ORG_REPO_TABLE_COLUMNS}
                pageSize={DEFAULT_REPO_LIMIT}
                onPaginationChange={handleTablePageChange}
                isLoading={isFetchingRepositories}
                totalLabel={showTotalLabel}
                current={page}
              />
            </div>
          </>
        )}
      </div>
      {error && (
        <div className={styles.errorContainer}>
          <Typography.Text type="danger">{error}</Typography.Text>
          <Button type="primary" onClick={handleRetryFetch}>
            Try again
          </Button>
        </div>
      )}
    </main>
  );
}
