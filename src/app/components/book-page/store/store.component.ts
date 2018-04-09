import { Component, OnInit } from '@angular/core';

import { BooksDataService } from '../../../services/books-data.service';
import { PayoutService } from '../../../services/payout.service';

import { Book } from '../../../model/book';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css']
})
export class StoreComponent implements OnInit {

  books:Book[];
  book:Book;
  uids:String[];

  constructor(
    public bkData:BooksDataService,
    public payoutService:PayoutService
  ) { }

  ngOnInit() {

    this.payoutService.auth().subscribe(auth=>{
      if(auth){

        this.bkData.getUserIds().subscribe(data=>{
          this.uids = [];
          for(let d of data){
            this.uids.push(d.key);
          }
          this.getBooks();
        });

      }else{

        this.payoutService.loginAnonymously().then(()=>{
          this.bkData.getUserIds().subscribe(data=>{
            this.uids = [];
            for(let d of data){
              this.uids.push(d.key);
            }
            this.getBooks();
          });
        });
        
      }
    })
    
  }


  getBooks(){
    this.books = [];
    for(const id of this.uids){
    
      this.bkData.getUserForSaleBooks(id).subscribe(data=>{

        for(let d of data){
          this.book = JSON.parse(d.payload.val());
          this.book.changePrice = false;
          if(this.book.title_long.length > 23){
            this.book.title_long = this.book.title_long.slice(0,23)+"...";
          }
          if(this.book.authors[0].length > 14){
            this.book.authors[0]=this.book.authors[0].slice(0,14)+"..."
          }
          this.books.unshift(this.book);

        }
        this.books.sort(function(a,b){
          return b.time - a.time
        })
        
      });
    }
  }
}