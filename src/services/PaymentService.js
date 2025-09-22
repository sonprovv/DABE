class PaymentService {
    constructor() {}

    async createPayment(clientID, amount) {
        try {
            const now = new Date();
            const month = now.getMonth() + 1;
            const year = now.getFullYear();

            const date = `Tháng ${month.toString().padStart(2, '0')}/${year}`;

        } catch (err) {
            console.log(err.meesage)
            throw new Error("Thêm mới payment không thành công")
        }
    }
}

module.exports = new PaymentService();