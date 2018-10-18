import { Component } from '@angular/core';
import { NavController, NavParams ,ModalController } from 'ionic-angular';
import * as WC from 'woocommerce-api';
import { ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import {CartPage} from '../cart/cart'


@Component({
  selector: 'page-product-details',
  templateUrl: 'product-details.html',
})
export class ProductDetailsPage {

  product: any;
  WooCommerce: any; 
  reviews: any[];

  constructor(public navCtrl: NavController, public navParams: NavParams, public storage: Storage, private toastCtrl: ToastController,public modalCtrl: ModalController) {
    this.product = this.navParams.get("product");
    console.log(this.product);
    this.reviews=[];


    this.WooCommerce = WC({
      url: "https://demo1.tusharahmed.com",
      consumerKey: "ck_3860468dbf8d369aab23127623cdfa638a9b49ff",
      consumerSecret: "cs_f1d5f148b72495eb91ca1f4d7869dad5ae55637e",
      wpAPI: true,
      queryStringAuth: true,
      verifySsl: true,
      version: 'wc/v2'
    });


    this.WooCommerce.getAsync('products/'+this.product.id +'/reviews').then((data) =>{
      this.reviews = JSON.parse(data.body);
      console.log(this.reviews);
    },(err)=>{
      console.log(err);
    })
  }

  addToCart(product){
    this.storage.get("cart").then((data)=>{
      if(data == null || data.length == 0){
        data =[];
        data.push({
          "product": product,
          "qty": 1,
          "amount": parseFloat(product.price)
        });
      }else{
        let added = 0;
        for(let i =0; i<data.length; i++){
          if(product.id == data[i].product.id){
            console.log("Product is already added");
            let qty = data[i].qty;

            data[i].qty = qty+1;
            data[i].amount = parseFloat(data[i].amount) + parseFloat(data[i].product.price);
            added = 1;
          }
        }
        if(added== 0){
          data.push({
            "product": product,
            "qty": 1,
            "amount": parseFloat(product.price)
          });
        }
      }
      this.storage.set("cart",data).then( () =>{
        console.log("Cart Updated");
        console.log(data);

        this.toastCtrl.create({
          message: "Cart Updated",
          duration: 3000
        }).present();
      })
      
    });
  }

  openCart(){
    this.modalCtrl.create(CartPage).present();
  }


}
