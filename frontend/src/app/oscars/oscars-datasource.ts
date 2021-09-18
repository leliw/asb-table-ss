import { DataSource } from '@angular/cdk/collections';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { map, startWith, switchMap } from 'rxjs/operators';
import { Observable, of as observableOf, merge, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';

export interface OscarsItem {
  id: number;
  title: string;
  oscarYear: string;
  studio: string;
  award: string;
  yearOfRelease: number;
  movieTime: number;
  genre: string;
}

interface PaginatedItems {
  totalElements: number;
  content: OscarsItem[];
}

/**
 * Data source for the Oscars view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class OscarsDataSource extends DataSource<OscarsItem> {
  data: OscarsItem[] = [];
  paginator: MatPaginator | undefined;
  sort: MatSort | undefined;

  apiUrl = environment.apiUrl + '/oscars';

  constructor(private http: HttpClient) {
    super()

  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<OscarsItem[]> {
    if (this.paginator && this.sort) {
      return merge(this.paginator.page, this.sort.sortChange)
        .pipe(
          startWith({}),
          switchMap(() => this.getPagedData()) 
        );
    } else {
      throw Error('Please set the paginator and sort on the data source before connecting.');
    }
  }

  private getPagedData(): Observable<OscarsItem[]> {
    let params = new HttpParams()
      .set("pageNo", this.paginator.pageIndex.toString())
      .set("pageSize", this.paginator.pageSize.toString());
    if (this.sort && this.sort.active && this.sort.direction !== '')
      params = params.append("sortBy", this.sort.active + "-" + this.sort.direction);

    return this.http.get<PaginatedItems>(this.apiUrl, { params: params })
      .pipe(map(data => {
        this.paginator.length = data.totalElements;
        return data.content;
      }))
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect(): void { }

}

