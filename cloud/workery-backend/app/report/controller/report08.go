package controller

import (
	"context"
	"fmt"
	"log/slog"
	"strconv"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type GenerateReport08Request struct {
	AssociateID primitive.ObjectID
	Status      int8
	ToDT        time.Time
	FromDT      time.Time
}

func (c *ReportControllerImpl) GenerateReport008(ctx context.Context, req *GenerateReport08Request) ([][]string, error) {
	a, err := c.AssociateStorer.GetByID(ctx, req.AssociateID)
	if err != nil {
		c.Logger.Error("failed looking up associate",
			slog.Any("associate_id", req.AssociateID),
			slog.Any("error", err))
		return [][]string{}, err
	}
	if a == nil {
		err := fmt.Errorf("associate does not exist for: %v", req.AssociateID.Hex())
		c.Logger.Warn("associate does not exist",
			slog.Any("associate_id", req.AssociateID))
		return [][]string{}, err
	}

	// Start by generating the header row.

	// Variable will be the CSV formatted data. Start with filling out the
	// header of the file.
	todayStr := time.Now().Format("2006-01-02")
	aID := strconv.FormatUint(a.PublicID, 10)
	rows := [][]string{
		{"Associate Skillsets Report"},
		{"Report Date:", todayStr, ""},
		{"Associate No.", aID},
		{"Associate Name:", a.Name, ""},
		{"", "", ""},
		{"", "", ""},
		{
			"Category",     // 1
			"Sub-Category", // 2
		},
	}

	//
	// Generate the CSV contents.
	//

	for _, ssv := range a.SkillSets {
		row := []string{
			ssv.Category,    // 1
			ssv.SubCategory, // 2
		}
		rows = append(rows, row)
	}
	return rows, err
}
