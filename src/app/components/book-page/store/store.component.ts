import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from "rxjs/Subscription";

import { BooksDataService } from '../../../services/books-data.service';
import { PayoutService } from '../../../services/payout.service';

import { Book } from '../../../model/book';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css']
})
export class StoreComponent implements OnInit, OnDestroy {

  private authSubscription: Subscription;
  private booksSubscription: Subscription;
  private bookSubscription: Subscription;

  constructor(
    public bkData:BooksDataService,
    public payoutService:PayoutService
  ) { }

  books:Book[];
  book:Book;
  uids:String[];
  loader:boolean;

  ngOnInit() {
    this.loader = true;
    this.authSubscription = this.payoutService.auth().subscribe(auth=>{
      if(!auth){
        this.payoutService.loginAnonymously();
        this.getAllBooks();
      }else{
        this.getAllBooks();
      }
    })
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
    // this.booksSubscription.unsubscribe();
    // this.bookSubscription.unsubscribe();
  }

  getAllBooks() {
    this.booksSubscription = this.bkData.getUserIds().subscribe(data=>{
      this.uids = [];
      for(let d of data){
        this.uids.push(d.key);
      }
      this.getBooks();
    });
  }

  getBooks(){
    this.books = [];

    for(const id of this.uids){
      this.bkData.getUserForSaleBooks(id).subscribe(data=>{
        for(let d of data){
          this.book = JSON.parse(d.payload.val());

          this.book.changePrice = false;

          let lastNumb = this.book.image.length - 1;
          this.book.image = this.book.image.slice(4,lastNumb);

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
        });

        this.loader = false;
      });
    }
  }
}
