import Invoice from "../models/Invoice.js";

/*

# CREATE INVOICE

*/
export const createInvoice = async (req, res) => {
try {
const invoice = await Invoice.create({
...req.body,
school: req.school,
balance: req.body.amount,
});

```
res.status(201).json({
  success: true,
  data: invoice,
});
```

} catch (error) {
res.status(500).json({
success: false,
message: error.message,
});
}
};

/*

# GET ALL INVOICES

*/
export const getInvoices = async (req, res) => {
try {
const invoices = await Invoice.find({
school: req.school,
}).populate("studentId");

```
res.json({
  success: true,
  data: invoices,
});
```

} catch (error) {
res.status(500).json({
success: false,
message: error.message,
});
}
};

/*

# GET SINGLE INVOICE

*/
export const getInvoiceById = async (req, res) => {
try {
const invoice = await Invoice.findOne({
_id: req.params.id,
school: req.school,
}).populate("studentId");

```
if (!invoice) {
  return res.status(404).json({
    success: false,
    message: "Invoice not found",
  });
}

res.json({
  success: true,
  data: invoice,
});
```

} catch (error) {
res.status(500).json({
success: false,
message: error.message,
});
}
};

/*

# UPDATE INVOICE

*/
export const updateInvoice = async (req, res) => {
try {
const invoice = await Invoice.findOneAndUpdate(
{
_id: req.params.id,
school: req.school,
},
req.body,
{
new: true,
}
);

```
if (!invoice) {
  return res.status(404).json({
    success: false,
    message: "Invoice not found",
  });
}

res.json({
  success: true,
  data: invoice,
});
```

} catch (error) {
res.status(500).json({
success: false,
message: error.message,
});
}
};

/*

# DELETE INVOICE

*/
export const deleteInvoice = async (req, res) => {
try {
const invoice = await Invoice.findOneAndDelete({
_id: req.params.id,
school: req.school,
});

```
if (!invoice) {
  return res.status(404).json({
    success: false,
    message: "Invoice not found",
  });
}

res.json({
  success: true,
  message: "Invoice deleted successfully",
});
```

} catch (error) {
res.status(500).json({
success: false,
message: error.message,
});
}
};
