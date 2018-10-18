import { Component } from '@angular/core';
import {  NavController, NavParams,ToastController,AlertController } from 'ionic-angular';
import * as WC from 'woocommerce-api';
import {OneSignal} from '@ionic-native/onesignal'

@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {

  newUser: any = {};
  billing_shipping_same: boolean;
  WooCommerce: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public toastCtrl: ToastController, public alertCtrl: AlertController,private oneSignal: OneSignal ) {
    this.newUser.billing_address= {};
    this.newUser.shipping_address = {};
    this.billing_shipping_same = false;

    this.WooCommerce = WC({
      url: "https://demo1.tusharahmed.com",
      consumerKey: "ck_3860468dbf8d369aab23127623cdfa638a9b49ff",
      consumerSecret: "cs_f1d5f148b72495eb91ca1f4d7869dad5ae55637e",
      wpAPI: true,
      queryStringAuth: true,
      verifySsl: true,
      version: 'wc/v2'
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SignupPage');
  }
  setBillingToShipping(){
    this.billing_shipping_same = !this.billing_shipping_same
  }
  checkEmail(){
    let validEmail = false;

    let reg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(reg.test(this.newUser.email)){
      this.WooCommerce.getAsync('customers?email='+this.newUser.email).then((data) =>{
        let res = (JSON.parse(data.body));
        console.log(res);

        if(res.length ==0 ){
          validEmail = true;
          this.toastCtrl.create({
            message: "Congratulations. Email is good to go",
            duration:3000
          }).present();
        }else{
          validEmail = false;
          this.toastCtrl.create({
            message: "Email already register. please give another one",
            duration:3000
          }).present();
        }
        console.log(validEmail);
      })
    }else{
      validEmail = false;
      this.toastCtrl.create({
        message: "Email envalid",
        showCloseButton: true
      }).present();
      console.log(validEmail);
    }
  }

  signup(){
    
    let customerData ={
      "email":this.newUser.email,
      "first_name":this.newUser.first_name,
      "last_name":this.newUser.last_name,
      "username":this.newUser.username,
      "password":this.newUser.password,
      "billing":{
        "first_name":this.newUser.first_name,
        "last_name":this.newUser.last_name,
        "company":"",
        "address_1":this.newUser.billing_address.address_1,
        "address_2":this.newUser.billing_address.address_2,
        "city":this.newUser.billing_address.city,
        "state":this.newUser.billing_address.state,
        "postcode":this.newUser.billing_address.postcode,
        "country":this.newUser.billing_address.country,
        "email":this.newUser.billing_address.email,
        "phone":this.newUser.billing_address.phone
      },
      "shipping":{
        "first_name":this.newUser.first_name,
        "last_name":this.newUser.last_name,
        "company":"",
        "address_1":this.newUser.shipping_address.address_1,
        "address_2":this.newUser.shipping_address.address_2,
        "city":this.newUser.shipping_address.city,
        "state":this.newUser.shipping_address.state,
        "postcode":this.newUser.shipping_address.postcode,
        "country":this.newUser.shipping_address.country
      }
    };
    if(this.billing_shipping_same){
      this.newUser.shipping_address = this.newUser.shipping_address;
    }
    this.WooCommerce.postAsync('customers',customerData).then((data) =>{
      let response =(JSON.parse(data.body));
      console.log(response);
      if(response){
        this.alertCtrl.create({
          title:"Account Created",
          message:"Your account has been created successfully",
          buttons:[{
            text:"Login",
            handler: ()=>{

            }
          }]

        }).present();
      }else if(response.errors){
        this.toastCtrl.create({
          message:response.errors[0].message,
          showCloseButton: true
        }).present();
      }
    })
  }


}
