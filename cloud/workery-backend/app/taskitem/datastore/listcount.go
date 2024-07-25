package datastore

import (
	"context"
	"sync"
)

// TaskItemPaginationListResult represents the paginated list results for
// the TaskItem records (meaning limited).
type TaskItemPaginationListAndCountResult struct {
	Results     []*TaskItem `json:"results"`
	NextCursor  string      `json:"next_cursor"`
	HasNextPage bool        `json:"has_next_page"`
	Count       int64       `json:"count"`
}

func (c *TaskItemStorerImpl) ListAndCountByFilter(ctx context.Context, f *TaskItemPaginationListFilter) (*TaskItemPaginationListAndCountResult, error) {
	var (
		listResult  *TaskItemPaginationListResult
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

	return &TaskItemPaginationListAndCountResult{
		Results:     listResult.Results,
		NextCursor:  listResult.NextCursor,
		HasNextPage: listResult.HasNextPage,
		Count:       countResult,
	}, nil
}
