import { Component } from '@angular/core';
import {  NavController, NavParams } from 'ionic-angular';
import * as WC from 'woocommerce-api';
import { ProductDetailsPage } from '../product-details/product-details';


@Component({
  selector: 'page-products-by-category',
  templateUrl: 'products-by-category.html',
})

export class ProductsByCategoryPage {
  WooCommerce: any;
  products: any[];
  page:number;
  category: any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.page = 1;
    this.category = this.navParams.get("category"); 
    this.WooCommerce = WC({
      url: "https://demo1.tusharahmed.com",
      consumerKey: "ck_3860468dbf8d369aab23127623cdfa638a9b49ff",
      consumerSecret: "cs_f1d5f148b72495eb91ca1f4d7869dad5ae55637e",
      wpAPI: true,
      queryStringAuth: true,
      verifySsl: true,
      version: 'wc/v2'
    });

    this.WooCommerce.getAsync("products?categories=" +this.category.slug).then((data) =>{
      console.log(JSON.parse(data.body));
      this.products = JSON.parse(data.body);
    },(err)=>{
      console.log(err);
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProductsByCategoryPage');

  }
  loadMoreProducts(event){
    this.page++;
    console.log("Getting page " + this.page);
    this.WooCommerce.getAsync("products?categories==" + this.category.slug + "&page" + this.page).then((data)=>{
      let temp = (JSON.parse(data.body));

      this.products = this.products.concat(JSON.parse(data.body))
      console.log(this.products);
      event.complete();

      if(temp.lenght < 10){
        event.enable(false);
      }
    })
  }
  openProductPage(product){
    this.navCtrl.push(ProductDetailsPage, {"product": product});
  }
}
