package controller

import (
	"context"

	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	orderincident_s "github.com/over55/monorepo/cloud/workery-backend/app/orderincident/datastore"
)

func (impl *OrderIncidentControllerImpl) GetByID(ctx context.Context, id primitive.ObjectID) (*orderincident_s.OrderIncident, error) {
	// Retrieve from our database the record for the specific id.
	oi, err := impl.OrderIncidentStorer.GetByID(ctx, id)
	if err != nil {
		impl.Logger.Error("database get by id error", slog.Any("error", err))
		return nil, err
	}
	if oi.Comments == nil { // BUGFIX
		oi.Comments = make([]*orderincident_s.OrderIncidentComment, 0)
		if err := impl.OrderIncidentStorer.UpdateByID(ctx, oi); err != nil {
			impl.Logger.Error("database update error", slog.Any("error", err))
			return nil, err
		}
	}

	//
	// Populate the feed.
	//

	feed := []orderincident_s.SortableByCreatedAt{}
	for _, oia := range oi.Attachments {
		feed = append(feed, oia)
	}
	for _, oic := range oi.Comments {
		feed = append(feed, oic)
	}
	// Sort all the values from greatest value to lowest value.
	orderincident_s.SortByCreatedAt(feed)
	oi.Feed = feed

	return oi, err
}
