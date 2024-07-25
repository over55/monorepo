package datastore

import (
	"context"
	"math"

	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func (impl OrderStorerImpl) GetByID(ctx context.Context, id primitive.ObjectID) (*Order, error) {
	filter := bson.D{{"_id", id}}

	var result Order
	err := impl.Collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			// This error means your query did not match any documents.
			return nil, nil
		}
		impl.Logger.Error("database get by user id error", slog.Any("error", err))
		return nil, err
	}

	if &result != nil {
		if math.IsNaN(result.AssociateServiceFeePercentage) {
			result.AssociateServiceFeePercentage = 0
		}
		if math.IsNaN(result.Hours) {
			result.Hours = 0
		}
		if math.IsNaN(result.Score) {
			result.Score = 0
		}
		if math.IsNaN(result.InvoiceQuoteAmount) {
			result.InvoiceQuoteAmount = 0
		}
		if math.IsNaN(result.InvoiceLabourAmount) {
			result.InvoiceLabourAmount = 0
		}
		if math.IsNaN(result.InvoiceMaterialAmount) {
			result.InvoiceMaterialAmount = 0
		}
		if math.IsNaN(result.InvoiceTaxAmount) {
			result.InvoiceTaxAmount = 0
		}
		if math.IsNaN(result.InvoiceTotalAmount) {
			result.InvoiceTotalAmount = 0
		}
		if math.IsNaN(result.InvoiceServiceFeeAmount) {
			result.InvoiceServiceFeeAmount = 0
		}
		if math.IsNaN(result.InvoiceServiceFeePercentage) {
			result.InvoiceServiceFeePercentage = 0
		}
		if math.IsNaN(result.InvoiceActualServiceFeeAmountPaid) {
			result.InvoiceActualServiceFeeAmountPaid = 0
		}
		if math.IsNaN(result.InvoiceBalanceOwingAmount) {
			result.InvoiceBalanceOwingAmount = 0
		}
		if math.IsNaN(result.InvoiceQuotedLabourAmount) {
			result.InvoiceQuotedLabourAmount = 0
		}
		if math.IsNaN(result.InvoiceQuotedMaterialAmount) {
			result.InvoiceQuotedMaterialAmount = 0
		}
		if math.IsNaN(result.InvoiceTotalQuoteAmount) {
			result.InvoiceTotalQuoteAmount = 0
		}
		if math.IsNaN(result.InvoiceDepositAmount) {
			result.InvoiceDepositAmount = 0
		}
		if math.IsNaN(result.InvoiceOtherCostsAmount) {
			result.InvoiceOtherCostsAmount = 0
		}
		if math.IsNaN(result.InvoiceQuotedOtherCostsAmount) {
			result.InvoiceQuotedOtherCostsAmount = 0
		}
		if math.IsNaN(result.InvoiceAmountDue) {
			result.InvoiceAmountDue = 0
		}
		if math.IsNaN(result.InvoiceSubTotalAmount) {
			result.InvoiceSubTotalAmount = 0
		}
	}
	return &result, nil
}

func (impl OrderStorerImpl) GetByWJID(ctx context.Context, wjID uint64) (*Order, error) {
	filter := bson.D{{"wjid", wjID}}

	var result Order
	err := impl.Collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			// This error means your query did not match any documents.
			return nil, nil
		}
		impl.Logger.Error("database get by user id error", slog.Any("error", err))
		return nil, err
	}
	if &result != nil {
		if math.IsNaN(result.AssociateServiceFeePercentage) {
			result.AssociateServiceFeePercentage = 0
		}
		if math.IsNaN(result.Hours) {
			result.Hours = 0
		}
		if math.IsNaN(result.Score) {
			result.Score = 0
		}
		if math.IsNaN(result.InvoiceQuoteAmount) {
			result.InvoiceQuoteAmount = 0
		}
		if math.IsNaN(result.InvoiceLabourAmount) {
			result.InvoiceLabourAmount = 0
		}
		if math.IsNaN(result.InvoiceMaterialAmount) {
			result.InvoiceMaterialAmount = 0
		}
		if math.IsNaN(result.InvoiceTaxAmount) {
			result.InvoiceTaxAmount = 0
		}
		if math.IsNaN(result.InvoiceTotalAmount) {
			result.InvoiceTotalAmount = 0
		}
		if math.IsNaN(result.InvoiceServiceFeeAmount) {
			result.InvoiceServiceFeeAmount = 0
		}
		if math.IsNaN(result.InvoiceServiceFeePercentage) {
			result.InvoiceServiceFeePercentage = 0
		}
		if math.IsNaN(result.InvoiceActualServiceFeeAmountPaid) {
			result.InvoiceActualServiceFeeAmountPaid = 0
		}
		if math.IsNaN(result.InvoiceBalanceOwingAmount) {
			result.InvoiceBalanceOwingAmount = 0
		}
		if math.IsNaN(result.InvoiceQuotedLabourAmount) {
			result.InvoiceQuotedLabourAmount = 0
		}
		if math.IsNaN(result.InvoiceQuotedMaterialAmount) {
			result.InvoiceQuotedMaterialAmount = 0
		}
		if math.IsNaN(result.InvoiceTotalQuoteAmount) {
			result.InvoiceTotalQuoteAmount = 0
		}
		if math.IsNaN(result.InvoiceDepositAmount) {
			result.InvoiceDepositAmount = 0
		}
		if math.IsNaN(result.InvoiceOtherCostsAmount) {
			result.InvoiceOtherCostsAmount = 0
		}
		if math.IsNaN(result.InvoiceQuotedOtherCostsAmount) {
			result.InvoiceQuotedOtherCostsAmount = 0
		}
		if math.IsNaN(result.InvoiceAmountDue) {
			result.InvoiceAmountDue = 0
		}
		if math.IsNaN(result.InvoiceSubTotalAmount) {
			result.InvoiceSubTotalAmount = 0
		}
	}
	return &result, nil
}
