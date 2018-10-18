import { Component, ViewChild } from '@angular/core';
import {  NavController, NavParams, ModalController } from 'ionic-angular';
import {Storage} from '@ionic/storage'
import {HomePage} from '../home/home';
import {CartPage} from '../cart/cart';
import {SignupPage} from '../signup/signup'
import * as WC from 'woocommerce-api';
import {ProductsByCategoryPage} from '../products-by-category/products-by-category'
import {LoginPage} from '../login/login'



@Component({
  selector: 'page-menu',
  templateUrl: 'menu.html',
})
export class MenuPage {

  WooCommerce: any;
  homePage: any;
  categories: any[];
  loggedIn: boolean;
  user: any;

  @ViewChild('content') childNavCtrl: NavController;
  
  constructor(public navCtrl: NavController, public navParams: NavParams, public storage: Storage, public modalCtrl: ModalController) {
    this.homePage = HomePage;
    this.categories = [];
    this.user = {};
    this.WooCommerce = WC({
      url: "https://demo1.tusharahmed.com",
      consumerKey: "ck_3860468dbf8d369aab23127623cdfa638a9b49ff",
      consumerSecret: "cs_f1d5f148b72495eb91ca1f4d7869dad5ae55637e",
      wpAPI: true,
      queryStringAuth: true,
      verifySsl: true,
      version: 'wc/v2'
    });
    this.WooCommerce.getAsync("products/categories").then((data) =>{
      console.log(JSON.parse(data.body));
      let temp: any[] = JSON.parse(data.body);

      for(let i = 0; i<temp.length; i++){
        if(temp[i].parent == 0){

          if(temp[i].slug== "men"){
            temp[i].icon = "ios-phone-portrait";

          }
          if(temp[i].slug== "accessories"){
            temp[i].icon = "md-briefcase";

          }
          if(temp[i].slug== "women"){
            temp[i].icon = "logo-buffer";

          }

          this.categories.push(temp[i]);
        }
      }

    },(err)=>{
      console.log(err);
    })
  }

  ionViewDidEnter() {
    this.storage.ready().then(() =>{
      this.storage.get("userLoginInfo").then((userLoginInfo) =>{
        if(userLoginInfo != null){
          console.log("User logged in...");
          this.user = userLoginInfo.user;
          console.log(this.user);
          this.loggedIn = true;
        }else{
          console.log("No user found");
          this.user = {};
          this.loggedIn = false;
        }
      })
    })
  }
  openCategoryPage(category){
    this.childNavCtrl.setRoot(ProductsByCategoryPage, {"category": category});
  }
  openPage(pageName: string){
    if(pageName == "signup"){
      this.navCtrl.push(SignupPage);
    }
    if(pageName == "login"){
      this.navCtrl.push(LoginPage);
    }
    if(pageName == "logout"){
      this.storage.remove("userLoginInfo").then(()=>{
        this.user = {};
        this.loggedIn = false;
      })
    }
    if(pageName == "cart"){
      let modal = this.modalCtrl.create(CartPage);
      modal.present();
    }
    
  }

}
