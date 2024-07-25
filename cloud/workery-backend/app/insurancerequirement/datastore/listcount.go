package datastore

import (
	"context"
	"sync"
)

// InsuranceRequirementPaginationListResult represents the paginated list results for
// the InsuranceRequirement records (meaning limited).
type InsuranceRequirementPaginationListAndCountResult struct {
	Results     []*InsuranceRequirement `json:"results"`
	NextCursor  string                  `json:"next_cursor"`
	HasNextPage bool                    `json:"has_next_page"`
	Count       int64                   `json:"count"`
}

func (c *InsuranceRequirementStorerImpl) ListAndCountByFilter(ctx context.Context, f *InsuranceRequirementPaginationListFilter) (*InsuranceRequirementPaginationListAndCountResult, error) {
	var (
		listResult  *InsuranceRequirementPaginationListResult
		countResult int64
		listErr     error
		countErr    error
		wg          sync.WaitGroup
	)

	// Increment the WaitGroup counter
	wg.Add(2)

	// Goroutine for ListByFilter
	go func() {
		defer wg.Done()
		listResult, listErr = c.ListByFilter(ctx, f)
	}()

	// Goroutine for CountByFilter
	go func() {
		defer wg.Done()
		countResult, countErr = c.CountByFilter(ctx, f)
	}()

	// Wait for all goroutines to finish
	wg.Wait()

	// Check for errors
	if listErr != nil {
		return nil, listErr
	}
	if countErr != nil {
		return nil, countErr
	}

	return &InsuranceRequirementPaginationListAndCountResult{
		Results:     listResult.Results,
		NextCursor:  listResult.NextCursor,
		HasNextPage: listResult.HasNextPage,
		Count:       countResult,
	}, nil
}
