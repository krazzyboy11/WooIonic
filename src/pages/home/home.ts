import { Component, ViewChild } from '@angular/core';
import { NavController, Slides, ToastController,LoadingController } from 'ionic-angular';
import * as WC from 'woocommerce-api';
import {ProductDetailsPage} from '../product-details/product-details'
import { SearchPage } from '../search/search';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  WooCommerce: any;
  products: any[];
  moreProducts: any[];
  page: number;
  searchQuery: string = "";

  @ViewChild('productSlides') productSlides: Slides;
  constructor(public navCtrl: NavController, public toastCtrl: ToastController,public loadingCtrl: LoadingController) {

    this.page = 2;

    this.WooCommerce = WC({
      url: "https://demo1.tusharahmed.com", // Your store URL
      consumerKey: "ck_175eea51e8c7628693e95709346f3e41e4fe6736", // Your consumer key
      consumerSecret: "cs_c0433db548576cd903390482d791504940e97bfe", // Your consumer secret
      wpAPI: true, // Enable the WP REST API integration
      queryStringAuth: true,
      verifySsl: true,
      version: 'wc/v2'
    });

    this.loadMoreProducts(null);

    this.WooCommerce.getAsync("products").then( (data) =>{
      this.products =JSON.parse(data.body);
      console.log(this.products);
  
    }, (err) =>{
      console.log(err)
    } )
  }

  ionViewDidLoad(){
    setInterval(() =>{
      if(this.productSlides.getActiveIndex() ==this.productSlides.length() -1){
        this.productSlides.slideTo(0);
      }
      this.productSlides.slideNext();
    }, 3000)
  }

  loadMoreProducts(event){
    if(event==null)
    {
      this.page = 2;
      this.moreProducts = [];
    }
    else
      this.page ++;

    this.WooCommerce.getAsync("products?page=" + this.page).then( (data) =>{
      this.moreProducts =this.moreProducts.concat(JSON.parse(data.body));

      if(event !=null){
        event.complete();
      }

      if(JSON.parse(data.body).length < 10 ){
        event.enable(false);
        this.toastCtrl.create({
          message: "No more products!",
          duration: 5000
        }).present();
      }
    }, (err) =>{
      console.log(err)
    } )
  }
  openProductPage(product){
    this.navCtrl.push(ProductDetailsPage, {"product": product});
  }
  onSearch(event){
    if(this.searchQuery.length >0){
      this.navCtrl.push(SearchPage, {"searchQuery": this.searchQuery});
    }
  }

  
}
