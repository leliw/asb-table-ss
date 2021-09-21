import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { AppService } from './app.service';
import { UsersComponent } from './users/users.component';
import { OscarsComponent } from './oscars/oscars.component';
import { OscarsDetailsComponent } from './oscars/oscars-details.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'users', component: UsersComponent,  canActivate: [AppService],  data: { role: "ADMIN" } },
  { path: 'oscars', component: OscarsComponent,  canActivate: [AppService],  data: { role: "USER" } },
  { path: 'oscars/:id', component: OscarsDetailsComponent,  canActivate: [AppService],  data: { role: "USER" } }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
