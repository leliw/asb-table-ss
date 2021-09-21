import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OscarsItem } from './oscars-datasource';

@Component({
  selector: 'app-oscars-delete',
  templateUrl: './oscars-delete.component.html',
  styleUrls: ['./oscars-delete.component.css']
})
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
