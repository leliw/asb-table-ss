# Angular - Spring Boot - Table - Server Side

In this project we implement table and CRUD features with sorting and filtering on server side. This solution is better for tables with lots of records. Every time only small subset of records is loaded form server.
Let's start with the previous project.

```bash
curl -L https://github.com/leliw/asb-table-cs/archive/refs/heads/main.zip -o main.zip
unzip main.zip
mv asb-table-cs-main asb-table-ss
cd asb-table-ss
# Start VS Code for developing frontend
code frontend &
# Start Eclipse fro developing backend
/c/Program\ Files/eclipse/jee-2021-03/eclipse -import backend -build backend &
```

## Data

I used Oscar Best Picture Movies data from https://www.kaggle.com/martinmraz07/oscar-movies. There are 571 records.

Let's create table in *schema-postgresql.sql*.
```sql
create table oscars (
	id serial primary key,
	title varchar(255),
	oscar_year varchar(7),
	studio varchar(100),
	award varchar(7),
	year_of_release integer,
	movie_time integer,
	genre varchar(255),
	imdb_rating real,
	imdb_votes integer,
	move_info text, 
	critic_consensus text,
	conten_rating varchar(25)
);
create unique index ix_oscars_title_year on oscars (title, year_of_release);
```

And add data in *data-postgresql.sql*.
```sql
insert into oscars(title, oscar_year, studio, award, year_of_release, movie_time, genre, imdb_rating, imdb_votes, move_info, critic_consensus, conten_rating) values
('Wings', '1927/28', 'Famous Players-Lasky', 'Winner', '1927', '144', 'Drama,Romance,War', '7.5', '12221', 'With World War I afoot, David Armstrong (Richard Arlen) and Jack Powell (Charles "Buddy" Rogers) join the military with an eye toward flying American fighter planes. They leave behind Mary Preston (Clara Bow), a local girl who''s in love with David but committed to Jack. Dispatched to France as newly minted pilots, the men take to the skies in one of the war''s climactic air battles, and as frantic Mary longs for the safe return of both men, one pays the ultimate price for his bravery.', 'Subsequent war epics may have borrowed heavily from the original Best Picture winner, but they''ve all lacked Clara Bow''s luminous screen presence and William Wellman''s deft direction.', 'PG-13'),
('7th Heaven', '1927/28', 'Fox', 'Nominee', '1927', '110', 'Drama,Romance', '7.7', '3439', '', '', ''),
('The Racket', '1927/28', 'The Caddo Company', 'Nominee', '1928', '84', 'Crime,Drama,Film-Noir', '6.7', '1257', '', '', ''),

(...)
```

## Backend without pagination

Lest's add backend CRUD features as before. That time it's standard solution with integer Id.

Oscar.java
```java
@Entity
@Table(name = "oscars")
public class Oscar {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)	
	public Integer id;
	public String title;
	public String oscarYear;
	public String studio;
	public String award;
	public Integer yearOfRelease;
	public Integer movieTime;
	public String genre;
	public Double imdbRating;
	public Integer imdbVotes;
	public String moveInfo;
	public String criticConsensus;
	public String contenRating;	
}
```

OscarRepository.java
```java
public interface UserRepository extends CrudRepository<User, String>{

}
```

OscarController.java
```java
@RestController
public class OscarController {
	@Autowired
	private OscarRepository repository;
	
	@GetMapping("/api/oscars")
	public @ResponseBody Iterable<Oscar> getAll() {
		Iterable<Oscar> ret = repository.findAll();
		return ret;
	}

	@GetMapping("/api/oscars/{Id}")
	public Oscar one(@PathVariable Integer Id) throws Exception {
		Oscar ret = this.repository.findById(Id)
				.orElseThrow(() -> new OscarNotFoundException(Id));
		return ret;
	}

	@PostMapping("/api/oscars")
	public Oscar newOne(@RequestBody Oscar item) {
		Oscar ret = this.repository.save(item);
		return ret;
	}
	
	@PutMapping("/api/oscars/{Id}")
	public Oscar replace(@RequestBody Oscar newItem, @PathVariable Integer Id)
			throws Exception {
		return repository.findById(Id).map(item -> {
			item.title = newItem.title;
			item.oscarYear = newItem.oscarYear;
			item.studio = newItem.studio;
			item.award = newItem.award;
			item.yearOfRelease = newItem.yearOfRelease;
			item.movieTime = newItem.movieTime;
			item.genre = newItem.genre;
			item.imdbRating = newItem.imdbRating;
			item.imdbVotes = newItem.imdbVotes;
			item.moveInfo = newItem.moveInfo;
			item.criticConsensus = newItem.criticConsensus;
			item.contenRating = newItem.contenRating;
			
			Oscar ret = repository.save(item);
			return ret;
		}).orElseGet(() -> {
			Oscar ret = repository.save(newItem);
			return ret;
		});
	}	

	@DeleteMapping("/api/oscars/{Id}")
	public void delete(@PathVariable Integer Id) {
		repository.deleteById(Id);
	}
}
```

OscarNotFoundException.java
```java
@SuppressWarnings("serial")
public class OscarNotFoundException extends Exception {
	public OscarNotFoundException(Integer id) {
		super("Could not find Oscar " + id);
	}
}
```

### Frontend without server side pagination

Generate a new component.
```bash
ng generate @angular/material:table oscars
```

Add routing in *app-routing.module.ts*.
```typescript
{ path: 'oscars', component: OscarsComponent,  canActivate: [AppService],  data: { role: "USER" } }
```

Add navigation link in *nav.component.html*.
```html
<a mat-list-item routerLink="/oscars" *ngIf="appService.hasRole('USER')">Oscars</a>
```

*oscar-datasource.ts*
```typescript
// TODO: Replace this with your own data model type
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
      // Combine everything that affects the rendered data into one update
      // stream for the data-table to consume.
      return merge(this.paginator.page, this.sort.sortChange,
        this.http.get<OscarsItem[]>(this.apiUrl).pipe(map(data => this.data = data)))
        .pipe(map(() => {
          return this.getPagedData(this.getSortedData([...this.data ]));
        }));
    } else {
      throw Error('Please set the paginator and sort on the data source before connecting.');
    }
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect(): void {}

  /**
   * Paginate the data (client-side). If you're using server-side pagination,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getPagedData(data: OscarsItem[]): OscarsItem[] {
    if (this.paginator) {
      const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      return data.splice(startIndex, this.paginator.pageSize);
    } else {
      return data;
    }
  }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: OscarsItem[]): OscarsItem[] {
    if (!this.sort || !this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort?.direction === 'asc';
      switch (this.sort?.active) {
        case 'name': return compare(a.title, b.title, isAsc);
        case 'id': return compare(+a.id, +b.id, isAsc);
        default: return 0;
      }
    });
  }
}
```

*oscars.component.ts*
```typescript
  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['id', 'title', 'oscarYear', 'studio', 'award', 'yearOfRelease', 'movieTime', 'genre'];
```

*oscars.component.html*
```html
<div class="mat-elevation-z8">
  <table mat-table class="full-width-table" matSort aria-label="Elements">
    <ng-container matColumnDef="id">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Id</th>
      <td mat-cell *matCellDef="let row">{{row.id}}</td>
    </ng-container>

    <ng-container matColumnDef="title">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Title</th>
      <td mat-cell *matCellDef="let row">{{row.title}}</td>
    </ng-container>

    <ng-container matColumnDef="oscarYear">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Oscar year</th>
      <td mat-cell *matCellDef="let row">{{row.oscarYear}}</td>
    </ng-container>

    <ng-container matColumnDef="studio">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Studio</th>
      <td mat-cell *matCellDef="let row">{{row.studio}}</td>
    </ng-container>

    <ng-container matColumnDef="award">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Award</th>
      <td mat-cell *matCellDef="let row">{{row.award}}</td>
    </ng-container>

    <ng-container matColumnDef="yearOfRelease">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Year of release</th>
      <td mat-cell *matCellDef="let row">{{row.yearOfRelease}}</td>
    </ng-container>

    <ng-container matColumnDef="movieTime">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Movie time</th>
      <td mat-cell *matCellDef="let row">{{row.movieTime}}</td>
    </ng-container>

    <ng-container matColumnDef="genre">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Genre</th>
      <td mat-cell *matCellDef="let row">{{row.genre}}</td>
    </ng-container>

    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
  </table>

  <mat-paginator #paginator
      [length]="dataSource?.data?.length"
      [pageIndex]="0"
      [pageSize]="15"
      [pageSizeOptions]="[5, 10, 15, 20]">
  </mat-paginator>
</div>
```

Ok. Now it works as previos. Let's change.

## Backend pagination and sorting

Now we modify backend to handle pagination and sorting. There are only two steps.

First. Change base class of repository.
```java
public interface OscarRepository extends PagingAndSortingRepository<Oscar, Integer> {

}
````

Second. Change getAll() method of controller and add one extra method.
```java
	@GetMapping("/api/oscars")
	public @ResponseBody Iterable<Oscar> getAll(
			@RequestParam(required = false) Integer pageNo, 
            @RequestParam(required = false) Integer pageSize,
            @RequestParam(defaultValue = "id-asc") String[] sortBy) {
		
		List<Order> orders = new ArrayList<Order>();
		for (String sortOrder : sortBy) {
			String[] _sort = sortOrder.split("-");
			orders.add(new Order(getSortDirection(_sort[1]), _sort[0]));
		}
		if (pageNo != null)
			return  repository.findAll(PageRequest.of(pageNo, pageSize, Sort.by(orders)));
		else
			return repository.findAll(Sort.by(orders));
	}
	
	private Direction getSortDirection(String dir) {
		switch(dir) {
		case "asc":
		case "ASC":
			return Direction.ASC;
		case "desc":
		case "DESC":
			return Direction.DESC;
		default:
			return null;
		}
	}	
```

There are query params added which all are optional so client side pagination and sorting is still working. If parameter *pageNo* doesn't exist the pagination is disabled. If parameter *sortBy* doesn't exist the default order (id asc) is useed. The default order is based on primary key so it is time efficient.
There are used "-" as separator between field name and direction. You can also use "." or ",", but there are some problems :-).

## Frontend pagination and sorting

All changes is required in *oscars-datasource.ts*.

Remove getSortedData() method and compare() function. Change getPagedData() as below.
```typescript
interface PaginatedItems {
  totalElements: number;
  content: OscarsItem[];
}
```
```typescript
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
```
There is definition of simple interface mapping changed backend response. 

Steps of getPagedData() method:
1. Create pagination parameters - they are always send.
2. Add sorting parameter - it's optional (HttpParams class is immutable).
3. Call HTTP GET with defined parameters.
4. Define pipe where number of all elements in table is send to paginator object and paged records are returned.


Change connect() method.
```typescript
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
```

It's a bit strange so let me explain:
1. *this.paginator.page* and *this.sort.sortChange* are emitters. When user change something they emitt eventd. There are two streams of events.
2. *merge()* merges two streams into one stream which is processed by defined pipe.
3. *startWith()* adds an extra (empty - {}) object at the beginning of the stream so the pipe starts without emitting any event by *merge()*. It loads the first page wihout user interaction.
4. *switchMap()* switches from one stream to another. In this case stream of emitted events is switched to the one returned by getPagedData() and this stream is returned by the connect() method.

## Frontend CRUD

In previous project records was edited in dialog window. Is't ok for small records, but for many fields in a record it's better to create separate window with it's own url. Let's generate details component based on address-form:

```bash
$ ng generate @angular/material:address-form oscars/oscars-details --flat
```

Add new routing definition (*app.module.ts*).
```typescript
  { path: 'oscars/:id', component: OscarsDetailsComponent,  canActivate: [AppService],  data: { role: "USER" } }
```

Define editing form (*oscar-details.component.html*) for all fields.
```html
<form [formGroup]="detailsForm" novalidate (ngSubmit)="onSubmit()">
  <mat-card class="shipping-card">
    <mat-card-header>
      <mat-card-title>Oscar Best Picture Movie</mat-card-title>
    </mat-card-header>
    <mat-card-content>
      <div class="row">
        <div class="col">
          <mat-form-field class="full-width">
            <input matInput placeholder="Title" formControlName="title">
            <mat-error *ngIf="detailsForm.controls['title'].hasError('required')">
              Title is <strong>required</strong>
            </mat-error>
          </mat-form-field>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <mat-form-field class="full-width">
            <input matInput placeholder="Oscar year" formControlName="oscarYear">
            <mat-error *ngIf="detailsForm.controls['oscarYear'].hasError('required')">
              Oscar year is <strong>required</strong>
            </mat-error>
          </mat-form-field>
        </div>
        <div class="col">
          <mat-form-field class="full-width">
            <input matInput placeholder="Studio" formControlName="studio">
            <mat-error *ngIf="detailsForm.controls['studio'].hasError('required')">
              Studio is <strong>required</strong>
            </mat-error>
          </mat-form-field>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <mat-radio-group formControlName="award">
            <mat-radio-button value="Nominee">Nominne</mat-radio-button>
            <mat-radio-button value="Winner">Winner</mat-radio-button>
          </mat-radio-group>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <mat-form-field class="full-width">
            <input matInput placeholder="Year of release" formControlName="yearOfRelease">
            <mat-error *ngIf="detailsForm.controls['yearOfRelease'].hasError('required')">
              Year of release is <strong>required</strong>
            </mat-error> 
          </mat-form-field>
        </div>
        <div class="col">
          <mat-form-field class="full-width">
            <input matInput #movieTime maxlength="5" placeholder="Movie time" type="number" formControlName="movieTime">
            <mat-hint align="end">{{movieTime.value.length}} / 5</mat-hint>
          </mat-form-field>
        </div>
        <div class="col">
          <mat-form-field [style.width.%]="100" appearance="fill">
            <mat-label>Genre</mat-label>
            <mat-select matInput formControlName="genres" multiple> 
                <mat-option *ngFor="let genre of genres" [value]="genre">{{genre}}</mat-option>
            </mat-select>
            <mat-error *ngIf="detailsForm.controls['genres'].hasError('required')">
              Genre is <strong>required</strong>
            </mat-error>
          </mat-form-field>
        </div>
      </div>
      <div class="row">
      </div>
      <div class="row">
        <div class="col">
          <mat-form-field class="full-width">
            <textarea matInput placeholder="Critic consensus" formControlName="criticConsensus"></textarea>
          </mat-form-field>
        </div>
      </div>      
    </mat-card-content>
    <mat-card-actions>
      <button mat-raised-button color="primary" type="submit">Save</button>
      <button mat-raised-button color="warn" type="button" (click)="goBack()">Cancel</button>
    </mat-card-actions>
  </mat-card>
</form>

```

And corresponding *oscar-details.component.ts*:
```typescript
export class OscarsDetailsComponent {
  detailsForm = this.fb.group({
    id: null,
    title: [null, Validators.required],
    oscarYear: [null, Validators.required],
    studio: [null, Validators.required],
    award: null,
    yearOfRelease: [null, Validators.compose([ Validators.required, Validators.pattern('[0-9]{4}')])],
    movieTime: null,
    genre: null,
    genres: [null, Validators.required],
    imdbRating: null,
    imdbVotes: null,
    moveInfo: null,
    criticConsensus: null,
    contentRating: null
  });

  genres = [
    'Action & Adventure',
    'Adventure',
    'Animation', 
    'Art House & International', 
    'Biography',
    'Classics', 
    'Comedy', 
    'Crime',
    'Cult Movies', 
    'Documentary', 
    'Drama', 
    'Faith & Spirituality',
    'Family',
    'Film-Noir',
    'Gay & Lesbian',
    'History',
    'Horror', 
    'Kids & Family', 
    'Music',
    'Musical',
    'Musical & Performing Arts', 
    'Mystery & Suspense', 
    'Romance', 
    'Science Fiction & Fantasy', 
    'Special Interest', 
    'Sports & Fitness',
    'Television',
    'War',
    'Western', 
  ]

  private dataSource: OscarsDataSource;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private location: Location,
    http: HttpClient) {
      this.dataSource = new OscarsDataSource(http);
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params.id != '_new')
        this.dataSource.getItem(params.id).subscribe({
          next: (item) => {
            this.detailsForm.controls['genres'].setValue(item.genre.split(",")); 
            this.detailsForm.patchValue(item) 
          }
        });
    });
  }

  onSubmit(): void {
    this.detailsForm.controls['genre'].setValue(
      this.detailsForm.controls['genres'].value.map((x: string)=>x).join(",")
    );
    if (this.route.snapshot.paramMap.get('id') == '_new')
      this.dataSource.addItem(this.detailsForm.value).subscribe(
        data => { console.log('Success ', data), this.location.back(); },
        error => console.error('Opps ', error)
      );
    else
      this.dataSource.updateItem(this.detailsForm.value).subscribe(
        data => { console.log('Success ', data), this.location.back(); },
        error => console.error('Opps ', error)
      );  
  }

  goBack(): void {
    this.location.back();
  }
}
```

Add actions column in table (*oscars.component.html*):
```html
    <ng-container matColumnDef="actions">
      <th mat-header-cell *matHeaderCellDef>Actions
        <button mat-icon-button matTooltip="Click to Edit" class="iconbutton" color="primary" routerLink="/oscars/_new">
          <mat-icon aria-label="Add">add</mat-icon>
        </button>      
      </th>
      <td mat-cell *matCellDef="let row">
        <button mat-icon-button matTooltip="Click to Edit" class="iconbutton" color="primary" routerLink="/oscars/{{row.id}}">
          <mat-icon aria-label="Edit">edit</mat-icon>
        </button>
        <button mat-icon-button matTooltip="Click to Delete" class="iconbutton" color="warn" (click)="openDialog('Delete', row)">
          <mat-icon aria-label="Delete">delete</mat-icon>
        </button>
      </td>
    </ng-container>

    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
  </table>
```

And *oscars.component.ts*):
```typescript
  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['id', 'title', 'oscarYear', 'studio', 'award', 'yearOfRelease', 'movieTime', 'genre', 'actions'];

  constructor(private http: HttpClient, public dialog: MatDialog) {
    this.dataSource = new OscarsDataSource(http);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }

  onPageChange(event: PageEvent) {
    console.log(event)
    this.dataSource.paginator
  }

  openDialog(action: string, obj) {
    obj.action = action;
    const dialogRef = this.dialog.open(OscarsDeleteComponent, {
      data:obj
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result.event == 'Add'){
        this.dataSource.addItem(result.data).subscribe();
      }else if(result.event == 'Update'){
        this.dataSource.updateItem(result.data).subscribe();
      }else if(result.event == 'Delete'){
        this.dataSource.deleteItem(result.data).subscribe();
      }
    });
  }
```

Add CRUD methods in *oscars-datasource.ts*:
```typescript
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
```

This new component is ok for adding and editing records. Unfortunately deleting needs diffrent component with simple confirmation. Let's generate:
```bash
$ ng generate component oscars/oscars-delete --flat
```

Change component (*oscars-delete.component.html* and *oscars-delete.component.ts*):
```html
<h1 mat-dialog-title>Delete Oscar movie record</h1>
<div mat-dialog-content class="dialog">
    Sure to delete movie "<b>{{local_data.title}}</b>" from <b>{{local_data.yearOfRelease}}</b> year?
</div>
<div mat-dialog-actions style="justify-content: flex-end;">
    <button mat-button (click)="doAction()"    mat-flat-button color="primary">Delete</button>
    <button mat-button (click)="closeDialog()" mat-flat-button color="warn">Cancel</button>
</div>
```

```typescript
export class OscarsDeleteComponent {

  action:string;
  local_data:OscarsItem;

  constructor(    
    public dialogRef: MatDialogRef<OscarsDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.local_data = {...data};
    this.action = data.action;
  }

  doAction(){
    this.dialogRef.close({event:this.action,data:this.local_data});
  }

  closeDialog(){
    this.dialogRef.close({event:'Cancel'});
  }
}
```

## Record summary in table

Now everythigs work fine, but one thing can be improved. Even if the table doesn't show all record's fields always all fields are been read from database and sent over the net. In this case it's not the problem but for records in parent - child relation it can be issue. 

We have to create "summary" class which will have a few common fileds with a "full" class. These fields will be extracted to third, base class.
```java
@MappedSuperclass
public abstract class OscarBase {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	public Integer id;
	public String title;
	public String oscarYear;
	public String studio;
	public String award;
	public Integer yearOfRelease;
	public Integer movieTime;
	public String genre;
}
```

```java
@Entity(name = "OscarSummary")
@Table(name = "oscars")
public class OscarSummary extends OscarBase{
}
```

```java
@Entity(name = "Oscar")
@Table(name = "oscars")
public class Oscar extends OscarBase {
	public Double imdbRating;
	public Integer imdbVotes;
	public String moveInfo;
	public String criticConsensus;
	public String contenRating;
}
```

Declare summary repository:
```java
public interface OscarSummaryRepository extends PagingAndSortingRepository<OscarSummary, Integer> {

}
```

And correct controller to use summary classes in getAll() method:
```java
	@Autowired
	private OscarSummaryRepository summaryRepository;
	
	@GetMapping("/api/oscars")
	public @ResponseBody Iterable<OscarSummary> getAll(
			@RequestParam(required = false) Integer pageNo, 
            @RequestParam(required = false) Integer pageSize,
            @RequestParam(defaultValue = "id-asc") String[] sortBy) {
		
		List<Order> orders = new ArrayList<Order>();
		for (String sortOrder : sortBy) {
			String[] _sort = sortOrder.split("-");
			orders.add(new Order(getSortDirection(_sort[1]), _sort[0]));
		}
		if (pageNo != null)
			return  summaryRepository.findAll(PageRequest.of(pageNo, pageSize, Sort.by(orders)));
		else
			return summaryRepository.findAll(Sort.by(orders));
	}
```


References:
1. https://howtodoinjava.com/spring-boot2/pagination-sorting-example/
2. https://www.bezkoder.com/spring-boot-pagination-sorting-example/
3. https://angular.io/guide/rx-library
4. https://vladmihalcea.com/map-multiple-jpa-entities-one-table-hibernate/
