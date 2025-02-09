import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductFormComponent } from './product-form/product-form.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { PlantFormComponent } from './product-form/plant-form.component';
import { CategoryFormComponent } from './product-form/category-form.component';
import { DestinationFormComponent } from './product-form/destination.form';


const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: ProductListComponent },
      { path: 'new', component: ProductFormComponent },
      { path: 'edit/:id', component: ProductFormComponent },
      { path: 'details/:id', component: ProductDetailsComponent },
      { path: 'categories', component: ProductListComponent },
      { path: 'inventory', component: ProductFormComponent },
      {path: 'plants/create' , component: PlantFormComponent},
      {path: 'categories/create' , component: CategoryFormComponent},
      {path: 'destination/create' , component: DestinationFormComponent},
      {path: 'destination/edit/:id' , component: DestinationFormComponent}


    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }

