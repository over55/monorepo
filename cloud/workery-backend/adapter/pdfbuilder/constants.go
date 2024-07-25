package pdfbuilder

const (
	PaymentMethodOther          = 1
	PaymentMethodCash           = 2
	PaymentMethodCheque         = 3
	PaymentMethodETransfer      = 4
	PaymentMethodDebit          = 5
	PaymentMethodCredit         = 6
	PaymentMethodPurchaseOrder  = 7
	PaymentMethodCryptocurrency = 8
)

var PaymentMethodLabels = map[int8]string{
	PaymentMethodOther:          "Other",
	PaymentMethodCash:           "Cash",
	PaymentMethodCheque:         "Cheque",
	PaymentMethodETransfer:      "E-Transfer",
	PaymentMethodDebit:          "Debit",
	PaymentMethodCredit:         "Credit",
	PaymentMethodPurchaseOrder:  "Purchase Order",
	PaymentMethodCryptocurrency: "Cryptocurrency",
}
