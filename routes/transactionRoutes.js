const { createTransaction,
    getAllTransactions,
    getTransactionById,
    deleteTransaction,
    updateTransaction,
    getAllFilterTransactions,
    createOfflineBillTransaction,
    getAllOfflineTransactions,
    getOfflineTransactionById,
    deleteOfflineTransaction,
    updateOfflineTransaction,
    getAllFilterOfflineTransactions
} = require("../controllers/transactionController");

const { verifyToken } = require("../utils/common");


module.exports = (router) => {
    router.post('/transaction', createTransaction);
    router.get('/transactions', getAllTransactions);
    router.get('/transaction/:id', getTransactionById);
    router.delete('/transaction/:id', deleteTransaction);
    router.put('/transaction/:id', updateTransaction);
    router.get("/my-transactions", verifyToken, getAllFilterTransactions);


    // OFFLINE BILLS TRANSACTION

    router.post('/offline-bill-transaction', createOfflineBillTransaction);
    router.get('/offline-bill-transactions', getAllOfflineTransactions);
    router.get('/offline-bill-transaction/:id', getOfflineTransactionById);
    router.delete('/offline-bill-transaction/:id', deleteOfflineTransaction);
    router.put('/offline-bill-transaction/:id', updateOfflineTransaction);
    router.get("/offline-bill-my-transactions", verifyToken, getAllFilterOfflineTransactions);

};