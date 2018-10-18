import { Component } from '@angular/core';
import {  NavController, NavParams } from 'ionic-angular';
import * as WC from 'woocommerce-api';
import { ProductDetailsPage } from '../product-details/product-details';


@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})


export class SearchPage {

  searchQuery: string = "";
  WooCommerce: any; 
  products: any[]=[];
  page: number = 2;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    console.log(this.navParams.get("searchQuery"));
    this.searchQuery = this.navParams.get("searchQuery");


    this.WooCommerce = WC({
      url: "https://demo1.tusharahmed.com",
      consumerKey: "ck_3860468dbf8d369aab23127623cdfa638a9b49ff",
      consumerSecret: "cs_f1d5f148b72495eb91ca1f4d7869dad5ae55637e",
      wpAPI: true,
      queryStringAuth: true,
      verifySsl: true,
      version: 'wc/v2'
    });
    this.WooCommerce.getAsync("products?search=" +this.searchQuery).then((searchData)=>{
      this.products = JSON.parse(searchData.body);
      console.log(this.products);
    })
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SearchPage');
  }

  loadMoreProducts(event){
    this.WooCommerce.getAsync("products?search=" +this.searchQuery +"&page=" +this.page).then((searchData)=>{
      this.products = this.products.concat(JSON.parse(searchData.body));
      if(JSON.parse(searchData.body).lenght < 10){
        event.enable(false);
      }
      event.complete();
      this.page ++;
    })
  }
  openProductPage(product){
    this.navCtrl.push(ProductDetailsPage, {"product": product});
  }
}
