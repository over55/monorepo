package datastore

import (
	"context"
	"sync"
)

// CustomerPaginationLiteListResult represents the paginated list results for
// the customer lite records (meaning limited).
type CustomerPaginationLiteListAndCountResult struct {
	Results     []*CustomerLite `json:"results"`
	NextCursor  string          `json:"next_cursor"`
	HasNextPage bool            `json:"has_next_page"`
	Count       int64           `json:"count"`
}

// CustomerPaginationListResult represents the paginated list results for
// the customer records (meaning limited).
type CustomerPaginationListAndCountResult struct {
	Results     []*Customer `json:"results"`
	NextCursor  string      `json:"next_cursor"`
	HasNextPage bool        `json:"has_next_page"`
	Count       int64       `json:"count"`
}

func (c *CustomerStorerImpl) LiteListAndCountByFilter(ctx context.Context, f *CustomerPaginationListFilter) (*CustomerPaginationLiteListAndCountResult, error) {
	var (
		listResult  *CustomerPaginationLiteListResult
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

	return &CustomerPaginationLiteListAndCountResult{
		Results:     listResult.Results,
		NextCursor:  listResult.NextCursor,
		HasNextPage: listResult.HasNextPage,
		Count:       countResult,
	}, nil
}

func (c *CustomerStorerImpl) ListAndCountByFilter(ctx context.Context, f *CustomerPaginationListFilter) (*CustomerPaginationListAndCountResult, error) {
	var (
		listResult  *CustomerPaginationListResult
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

	return &CustomerPaginationListAndCountResult{
		Results:     listResult.Results,
		NextCursor:  listResult.NextCursor,
		HasNextPage: listResult.HasNextPage,
		Count:       countResult,
	}, nil
}
