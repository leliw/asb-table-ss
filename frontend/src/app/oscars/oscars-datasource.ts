import { DataSource } from '@angular/cdk/collections';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Observable, of as observableOf, merge, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';

export interface OscarsItem {
  id: number;
  title: string;
  oscarYear: string;
  studio: string;
  award: string;
  yearOfRelease: number;
  movieTime: number;
  genre: string;
  imdbRating: number;
  imdbVotes: number;
  moveInfo: string;
  criticConsensus: string;
  contentRating: string;
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
  
  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect(): void { }

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

  public getItem(id: number): Observable<OscarsItem> {
    return this.http.get<OscarsItem>(this.apiUrl + '/' + id);
  }

  public addItem(newItem: OscarsItem) {
    return this.http.post<OscarsItem>(this.apiUrl, newItem)
      .pipe(
        catchError(this.handleError),
        map((savedItem) => {
          this.data.push(savedItem);
          if (this.paginator !== undefined)
              this.paginator.page.emit();
        })
      );
  }

  public updateItem(updatedItem: OscarsItem): Observable<void> {
    console.log(updatedItem);
    return this.http.put<OscarsItem>(this.apiUrl + '/' + updatedItem.id, updatedItem)
      .pipe(
        catchError(this.handleError),
        map((savedItem) => {
          this.data = this.data.filter((value, key) => {
            if(value.id == savedItem.id && this.paginator !== undefined) {
              this.paginator.page.emit();
            }
            return true;
          })
        }
        )
      );
  }

  deleteItem(deletedItem: OscarsItem): Observable<void> {
    return this.http.delete(this.apiUrl + '/' + deletedItem.id)
      .pipe(
        catchError(this.handleError),
        map(() => {
          this.data = this.data.filter((value) => {
            return value.id != deletedItem.id;
          });
          if (this.paginator !== undefined)
            this.paginator.page.emit();
        })
      );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // Return an observable with a user-facing error message.
    return throwError(
      'Something bad happened; please try again later.');
  }

}

