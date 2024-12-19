class Paged {
    constructor(page, object, perPage, totalResults) {
        this.page = page
        this.result = object
        this.totalPages = Math.ceil(totalResults / perPage)
        this.totalResults = totalResults
    }
    toObject() {
        return {
            page: this.page,
            result: this.result,
            totalPages: this.totalPages,
            totalResults: this.totalResults
        }
    }
}

module.exports = Paged;