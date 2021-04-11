import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UploadComponent } from './upload/upload.component';
import { HomePageComponent } from './home-page/home-page.component';
import { ContainerComponent } from './container/container.component';

const routes: Routes = [
  { path: '', component: HomePageComponent },
  {
    path: ':name',
    children: [
      { path: '', component: ContainerComponent },
      { path: 'upload', component: UploadComponent }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
