export interface Product {
    id: string;
    name: string;
    sku: string;
    description: string;
    categoryId: string;
    brandId: string;
    status: ProductStatus;
    price: {
      base: number;
      discounted?: number;
      wholesale?: number;
      currency: string;
    };
    inventory: {
      quantity: number;
      reorderPoint: number;
      reorderQuantity: number;
      location: string;
    };
    specifications: {
      [key: string]: string;
    };
    variants: ProductVariant[];
    images: string[];
    tags: string[];
    metadata: {
      createdAt: Date;
      updatedAt: Date;
      createdBy: string;
      updatedBy: string;
    };
  }
  
  export interface ProductVariant {
    id: string;
    sku: string;
    name: string;
    attributes: {
      [key: string]: string;
    };
    price: number;
    inventory: number;
    images: string[];
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
  