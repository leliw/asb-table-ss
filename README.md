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



References:
1. https://howtodoinjava.com/spring-boot2/pagination-sorting-example/
2. https://www.bezkoder.com/spring-boot-pagination-sorting-example/
3. https://angular.io/guide/rx-library
