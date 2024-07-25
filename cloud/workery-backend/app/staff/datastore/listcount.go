package datastore

import (
	"context"
	"sync"
)

// StaffPaginationLiteListResult represents the paginated list results for
// the Staff lite records (meaning limited).
type StaffPaginationLiteListAndCountResult struct {
	Results     []*StaffLite `json:"results"`
	NextCursor  string          `json:"next_cursor"`
	HasNextPage bool            `json:"has_next_page"`
	Count       int64           `json:"count"`
}

// StaffPaginationListResult represents the paginated list results for
// the Staff records (meaning limited).
type StaffPaginationListAndCountResult struct {
	Results     []*Staff `json:"results"`
	NextCursor  string      `json:"next_cursor"`
	HasNextPage bool        `json:"has_next_page"`
	Count       int64       `json:"count"`
}

func (c *StaffStorerImpl) LiteListAndCountByFilter(ctx context.Context, f *StaffPaginationListFilter) (*StaffPaginationLiteListAndCountResult, error) {
	var (
		listResult  *StaffPaginationLiteListResult
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

	return &StaffPaginationLiteListAndCountResult{
		Results:     listResult.Results,
		NextCursor:  listResult.NextCursor,
		HasNextPage: listResult.HasNextPage,
		Count:       countResult,
	}, nil
}

func (c *StaffStorerImpl) ListAndCountByFilter(ctx context.Context, f *StaffPaginationListFilter) (*StaffPaginationListAndCountResult, error) {
	var (
		listResult  *StaffPaginationListResult
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

	return &StaffPaginationListAndCountResult{
		Results:     listResult.Results,
		NextCursor:  listResult.NextCursor,
		HasNextPage: listResult.HasNextPage,
		Count:       countResult,
	}, nil
}
