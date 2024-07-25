package datastore

import (
	"context"
	"sync"
)

// AssociatePaginationLiteListResult represents the paginated list results for
// the Associate lite records (meaning limited).
type AssociatePaginationLiteListAndCountResult struct {
	Results     []*AssociateLite `json:"results"`
	NextCursor  string           `json:"next_cursor"`
	HasNextPage bool             `json:"has_next_page"`
	Count       int64            `json:"count"`
}

// AssociatePaginationListResult represents the paginated list results for
// the Associate records (meaning limited).
type AssociatePaginationListAndCountResult struct {
	Results     []*Associate `json:"results"`
	NextCursor  string       `json:"next_cursor"`
	HasNextPage bool         `json:"has_next_page"`
	Count       int64        `json:"count"`
}

func (c *AssociateStorerImpl) LiteListAndCountByFilter(ctx context.Context, f *AssociatePaginationListFilter) (*AssociatePaginationLiteListAndCountResult, error) {
	var (
		listResult  *AssociatePaginationLiteListResult
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
		listResult, listErr = c.LiteListByFilter(ctx, f)
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

	return &AssociatePaginationLiteListAndCountResult{
		Results:     listResult.Results,
		NextCursor:  listResult.NextCursor,
		HasNextPage: listResult.HasNextPage,
		Count:       countResult,
	}, nil
}

func (c *AssociateStorerImpl) ListAndCountByFilter(ctx context.Context, f *AssociatePaginationListFilter) (*AssociatePaginationListAndCountResult, error) {
	var (
		listResult  *AssociatePaginationListResult
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

	return &AssociatePaginationListAndCountResult{
		Results:     listResult.Results,
		NextCursor:  listResult.NextCursor,
		HasNextPage: listResult.HasNextPage,
		Count:       countResult,
	}, nil
}
