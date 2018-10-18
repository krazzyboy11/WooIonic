import { Component } from '@angular/core';
import { NavController, NavParams,AlertController } from 'ionic-angular';
import {Storage} from '@ionic/storage';
import {HomePage} from '../home/home'
import *as WC from 'woocommerce-api';
import { PayPal, PayPalPayment, PayPalConfiguration } from '@ionic-native/paypal';

@Component({
  selector: 'page-checkout',
  templateUrl: 'checkout.html',
})
export class CheckoutPage {

  WooCommerce: any;
  newOrder: any;
  paymentMethods: any[];
  paymentMethod: any;
  billing_shipping_same: boolean;
  userInfo: any; 
  order: any;
  

  constructor(public navCtrl: NavController, public navParams: NavParams,public storage: Storage,public alertCtrl: AlertController,public paypal: PayPal) {
    this.newOrder = {}; 
    this.newOrder.billing = {};
    this.newOrder.shipping = {};
    this.billing_shipping_same = false;

    this.paymentMethods = [
      { method_id: "bacs", method_title: "Direct Bank Transfer"},
      { method_id: "cheque", method_title: "Cheque Payment"},
      { method_id: "cod", method_title: "Cash on Delivery"},
      { method_id: "paypal", method_title: "Paypal"}
    ];

    this.WooCommerce = WC({
      url: "https://demo1.tusharahmed.com",
      consumerKey: "ck_3860468dbf8d369aab23127623cdfa638a9b49ff",
      consumerSecret: "cs_f1d5f148b72495eb91ca1f4d7869dad5ae55637e",
      wpAPI: true,
      queryStringAuth: true,
      verifySsl: true,
      version: 'wc/v2'
    });
    this.storage.get("userLoginInfo").then((userLoginInfo) =>{
      this.userInfo =userLoginInfo.user;
      console.log(this.userInfo);
      let email = userLoginInfo.user.email;
      this.WooCommerce.getAsync('customers?email='+email).then((data)=>{
        this.newOrder = JSON.parse(data.body);
        this.order = this.newOrder[0];
        console.log(this.order);
      })
    })
  }

  setBillingToShipping(){
    this.billing_shipping_same = !this.billing_shipping_same;
    if(this.billing_shipping_same){
      this.newOrder.shipping = this.newOrder.billing;
    }
  }

  placeOrder(){
    let orderItems: any[]=[];
    let data: any ={};

    let paymentData: any ={};

    this.paymentMethods.forEach((element ,index)=>{
      if(element.method_id== this.paymentMethod){
        paymentData =element;
      }
    }); 

    data = {
      payment_method: paymentData.method_id,
      payment_method_title: paymentData.method_title,
      set_paid: true,

      billing: this.order.billing,
      shipping: this.order.shipping,
      customer_id: this.userInfo.id || '',
      line_items: orderItems
    };

    if(paymentData.method_id == "paypal"){
      this.paypal.init({
        PayPalEnvironmentProduction: 'YOUR_PRODUCTION_CLIENT_ID',
        PayPalEnvironmentSandbox: 'AS8AdILeP3E9hKCxF7zj64xHtA3OWSMuWXw1OdLw3W3_4Nk9EkWZGkEObnML_mS7s1kCfaMPCrXbdXo-'
      }).then(() => {
        // Environments: PayPalEnvironmentNoNetwork, PayPalEnvironmentSandbox, PayPalEnvironmentProduction
        this.paypal.prepareToRender('PayPalEnvironmentSandbox', new PayPalConfiguration({
          // Only needed if you get an "Internal Service Error" after PayPal login!
          //payPalShippingAddressOption: 2 // PayPalShippingAddressOptionPayPal
        })).then(() => {

          this.storage.get("cart").then((cart) =>{
            let total = 0.00;
            cart.forEach((element , index) =>{
              orderItems.push({product_id:element.product.id, quantity: element.qty});
              total = total + (element.product.price * element.qty);
            });
            let payment = new PayPalPayment(total.toString(), 'USD', 'Description', 'sale');
          this.paypal.renderSinglePaymentUI(payment).then((response) => {
            // Successfully paid
      
            alert(JSON.stringify(response));
            data.line_items = orderItems;
            console.log(data);
            let orderData: any = {};
            orderData.order = data;
            this.WooCommerce.postAsync("orders", orderData.order).then((order)=>{
              let response = (JSON.parse(order.body));
              console.log(JSON.parse(order.body));
              this.alertCtrl.create({
                title:"Order Placed Successfully",
                message:"Your order has been placed successfully. Your order number is "+ response.number,
                buttons:[{
                  text: "OK",
                  handler: ()=>{
                    this.navCtrl.setRoot(HomePage);
                  }
                }]
              }).present();
            })
          })
          
          }, () => {
            // Error or render dialog closed without being successful
          });
        }, () => {
          // Error in configuration
        });
      }, () => {
        // Error in initialization, maybe PayPal isn't supported or something else
      });

    }else{
      this.storage.get("cart").then((cart)=>{
        cart.forEach((element, index) =>{
          orderItems.push({
            product_id: element.product.id,
            quantity: element.qty
          });
        });
        data.line_items = orderItems;
        let orderData: any ={};
        orderData.order = data;
        this.WooCommerce.postAsync("orders", orderData.order).then((order)=>{
          let response = (JSON.parse(order.body));
          console.log(JSON.parse(order.body));
          this.alertCtrl.create({
            title:"Order Placed Successfully",
            message:"Your order has been placed successfully. Your order number is "+ response.number,
            buttons:[{
              text: "OK",
              handler: ()=>{
                this.navCtrl.setRoot(HomePage);
              }
            }]
          }).present();
        });
      })
    }
  }
}
