export interface Product {
  _id: string;
  name: string;
  price: number;
  categoryId: {
    _id: string;
    name: string;
  };
  inStock: boolean;
  image: string;
totalStock:number
}



export interface Category {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  image?: string;
  attributes: CategoryAttribute[];
}

export interface CategoryAttribute {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  required: boolean;
  options?: string[];
}

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
  DISCONTINUED = 'discontinued'
}