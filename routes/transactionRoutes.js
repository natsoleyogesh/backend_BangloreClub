const { createTransaction,
    getAllTransactions,
    getTransactionById,
    deleteTransaction,
    updateTransaction,
    getAllFilterTransactions
} = require("../controllers/transactionController");

const { verifyToken } = require("../utils/common");


module.exports = (router) => {
    router.post('/transaction', createTransaction);
    router.get('/transactions', getAllTransactions);
    router.get('/transaction/:id', getTransactionById);
    router.delete('/transaction/:id', deleteTransaction);
    router.put('/transaction/:id', updateTransaction);
    router.get("/my-transactions", verifyToken, getAllFilterTransactions)
};
