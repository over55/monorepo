package taskqueue

import (
	"context"
	"log"
)

// createAwayLogOnAnyRequiredExpiredDates is a task that will create away log entries for any associate whom has any required expired dates in their profile.
func (h *Handler) createAwayLogOnAnyRequiredExpiredDates(ctx context.Context) {
	log.Println("NOT IMPLEMENTED: CreateAwayLogOnAnyRequiredExpiredDates")
}
