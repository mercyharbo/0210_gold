import type { components } from './api-schema'

type Schemas = components['schemas']
export type CatalogProduct = Schemas['ProductData']
export type CatalogCategory = Schemas['CategoryData']
export type CatalogBanner = Schemas['BannerData']
export type CatalogPage = Schemas['ProductPage']
export type CatalogPrice = Schemas['PriceData']
export type CatalogSettings = Schemas['SettingsBody-Output']
export type CatalogRate = Schemas['RateData']
export type UploadAuthorization = Schemas['UploadData']
export type ManagedImage = Schemas['ImageData']
export type CatalogKind = 'products' | 'categories' | 'banners'
