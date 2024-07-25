package controller

import (
	"log/slog"

	"go.mongodb.org/mongo-driver/mongo"

	howhear_s "github.com/over55/monorepo/cloud/workery-backend/app/howhear/datastore"
)

func (impl *HowHearAboutUsItemControllerImpl) UpdateRelatedAssociates(sessCtx mongo.SessionContext, hh *howhear_s.HowHearAboutUsItem) error {
	alist, err := impl.AssociateStorer.ListByHowDidYouHearAboutUsID(sessCtx, hh.ID)
	if err != nil {
		impl.Logger.Error("failed listing", slog.Any("error", err))
		return err
	}
	for _, asso := range alist.Results {
		asso.HowDidYouHearAboutUsText = hh.Text
		if err := impl.AssociateStorer.UpdateByID(sessCtx, asso); err != nil {
			impl.Logger.Error("failed update by id", slog.Any("error", err))
			return err
		}
		impl.Logger.Debug("updated associate for how hear about us item",
			slog.Any("text", hh.Text),
			slog.String("associate_id", asso.ID.Hex()))
	}

	return nil
}

func (impl *HowHearAboutUsItemControllerImpl) UpdateRelatedCustomers(sessCtx mongo.SessionContext, hh *howhear_s.HowHearAboutUsItem) error {
	clist, err := impl.CustomerStorer.ListByHowDidYouHearAboutUsID(sessCtx, hh.ID)
	if err != nil {
		impl.Logger.Error("failed listing", slog.Any("error", err))
		return err
	}
	for _, cust := range clist.Results {
		cust.HowDidYouHearAboutUsText = hh.Text
		if err := impl.CustomerStorer.UpdateByID(sessCtx, cust); err != nil {
			impl.Logger.Error("failed update by id", slog.Any("error", err))
			return err
		}
		impl.Logger.Debug("updated customer for how hear about us item",
			slog.Any("text", hh.Text),
			slog.String("customer_id", cust.ID.Hex()))
	}
	return nil
}

func (impl *HowHearAboutUsItemControllerImpl) UpdateRelatedStaff(sessCtx mongo.SessionContext, hh *howhear_s.HowHearAboutUsItem) error {
	slist, err := impl.StaffStorer.ListByHowDidYouHearAboutUsID(sessCtx, hh.ID)
	if err != nil {
		impl.Logger.Error("failed listing", slog.Any("error", err))
		return err
	}
	for _, staff := range slist.Results {
		staff.HowDidYouHearAboutUsText = hh.Text
		if err := impl.StaffStorer.UpdateByID(sessCtx, staff); err != nil {
			impl.Logger.Error("failed update by id", slog.Any("error", err))
			return err
		}
		impl.Logger.Debug("updated staff for how hear about us item",
			slog.Any("text", hh.Text),
			slog.String("staff_id", staff.ID.Hex()))
	}
	return nil
}
