package datastore

import (
	"context"
	"sync"
)

// OrderPaginationLiteListResult represents the paginated list results for
// the Order lite records (meaning limited).
type OrderPaginationLiteListAndCountResult struct {
	Results     []*OrderLite `json:"results"`
	NextCursor  string          `json:"next_cursor"`
	HasNextPage bool            `json:"has_next_page"`
	Count       int64           `json:"count"`
}

// OrderPaginationListResult represents the paginated list results for
// the Order records (meaning limited).
type OrderPaginationListAndCountResult struct {
	Results     []*Order `json:"results"`
	NextCursor  string      `json:"next_cursor"`
	HasNextPage bool        `json:"has_next_page"`
	Count       int64       `json:"count"`
}

func (c *OrderStorerImpl) LiteListAndCountByFilter(ctx context.Context, f *OrderPaginationListFilter) (*OrderPaginationLiteListAndCountResult, error) {
	var (
		listResult  *OrderPaginationLiteListResult
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

	return &OrderPaginationLiteListAndCountResult{
		Results:     listResult.Results,
		NextCursor:  listResult.NextCursor,
		HasNextPage: listResult.HasNextPage,
		Count:       countResult,
	}, nil
}

func (c *OrderStorerImpl) ListAndCountByFilter(ctx context.Context, f *OrderPaginationListFilter) (*OrderPaginationListAndCountResult, error) {
	var (
		listResult  *OrderPaginationListResult
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

	return &OrderPaginationListAndCountResult{
		Results:     listResult.Results,
		NextCursor:  listResult.NextCursor,
		HasNextPage: listResult.HasNextPage,
		Count:       countResult,
	}, nil
}
