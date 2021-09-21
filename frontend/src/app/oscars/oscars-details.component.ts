import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OscarsDataSource, OscarsItem } from './oscars-datasource';
import { Location } from '@angular/common';
import { getMultipleValuesInSingleSelectionError } from '@angular/cdk/collections';

@Component({
  selector: 'app-oscars-details',
  templateUrl: './oscars-details.component.html',
  styleUrls: ['./oscars-details.component.css']
})
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
