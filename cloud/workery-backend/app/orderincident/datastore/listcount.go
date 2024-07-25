package datastore

import (
	"context"
	"sync"
)

// OrderIncidentPaginationListResult represents the paginated list results for
// the OrderIncident records (meaning limited).
type OrderIncidentPaginationListAndCountResult struct {
	Results     []*OrderIncident `json:"results"`
	NextCursor  string `json:"next_cursor"`
	HasNextPage bool   `json:"has_next_page"`
	Count       int64  `json:"count"`
}

func (c *OrderIncidentStorerImpl) ListAndCountByFilter(ctx context.Context, f *OrderIncidentPaginationListFilter) (*OrderIncidentPaginationListAndCountResult, error) {
	var (
		listResult  *OrderIncidentPaginationListResult
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

	return &OrderIncidentPaginationListAndCountResult{
		Results:     listResult.Results,
		NextCursor:  listResult.NextCursor,
		HasNextPage: listResult.HasNextPage,
		Count:       countResult,
	}, nil
}
