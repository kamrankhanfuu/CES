export default class Pagination<T> {

  results: Array<T>;
  page: number;
  totalPage: number;
  total: number;
  limit: number;

  constructor({results = new Array<T>(), page = 1, totalPage = 0, total = 0, limit = 10}: any) {
    this.results = results;
    this.page = page;
    this.totalPage = totalPage;
    this.total = total;
    this.limit = limit;
  }
}