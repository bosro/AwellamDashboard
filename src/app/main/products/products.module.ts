import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductsRoutingModule } from './products-routing.module';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductFormComponent } from './product-form/product-form.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ObjectUrlPipe } from '../../shared/pipe/object-url.pipe';
import { SharedModule } from '../../shared/shared.module';
import { PlantFormComponent } from './product-form/plant-form.component';
import { CategoryFormComponent } from './product-form/category-form.component';
import { DestinationFormComponent } from './product-form/destination.form';


@NgModule({
  declarations: [
    ProductListComponent,
    ProductFormComponent,
    ProductDetailsComponent,
    PlantFormComponent,
    CategoryFormComponent,
    DestinationFormComponent,
    ObjectUrlPipe
  ],
  imports: [
    CommonModule,
    ProductsRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class ProductsModule { }
