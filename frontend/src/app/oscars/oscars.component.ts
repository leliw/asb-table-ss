import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { OscarsDataSource, OscarsItem } from './oscars-datasource';
import { OscarsDeleteComponent } from './oscars-delete.component';

@Component({
  selector: 'app-oscars',
  templateUrl: './oscars.component.html',
  styleUrls: ['./oscars.component.css']
})
export class OscarsComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<OscarsItem>;
  dataSource: OscarsDataSource;

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

}
