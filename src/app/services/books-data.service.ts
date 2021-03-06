import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth, AngularFireAuthProvider } from 'angularfire2/auth';
import { Book } from '../model/book';

/* The books data are stored under sellbooks and track books parent node in Firebase Database*/
@Injectable()
export class BooksDataService {

  userId: string;
  userName: string;
  email: string;
  auth;

  constructor (
    private afdb: AngularFireDatabase,
    private afAuth: AngularFireAuth) {
    this.afAuth.authState.subscribe((auth) => {
      this.auth = auth;
      if (!auth || auth.isAnonymous) {
        return;
      }

      this.userId = auth.uid;
      this.userName = auth.displayName;
      this.email = auth.email;
    });
  }

  // push books owned by the user to the inventory
  booksInventory(id, book: Book) {
    if (!this.auth) {
      return;
    }
    console.log(book);
    const inventoryBook = { ...book };
    console.log(inventoryBook);
    return this.afdb.object(`/userBooks/${this.userId}/inventory/${id}`).set(inventoryBook);
  }

  // get books from the inventory
  getInventoryBooks() {
    if (!this.auth) {
      return;
    }
    return this.afdb.list(`/userBooks/${this.userId}/inventory`).valueChanges();
  }

  // get books from the inventory
  getPurchasedBooks(uid) {
    if (!this.auth) {
      return;
    }
    return this.afdb.list(`/buyBooks/${uid}`).snapshotChanges(['child_added']);
  }

  getPurchasedBook(uid, id) {
    if (!this.auth) {
      return;
    }
    return this.afdb.object(`/buyBooks/${uid}/${id}`).snapshotChanges();
  }

  getReturnAddress(uid) {
    if (!this.auth) {
      return;
    }
    return this.afdb.list(`/registered/${uid}/address`).valueChanges();
  }
  // set book sold data
  bookSold(id, book: Book) {
    if (!this.auth) {
      return;
    }
    return this.afdb.object(`/sellbooks/${this.userId}/soldBook/${id}`).set(JSON.stringify(book));
  }

  updateBookSold(id, book: Book, uid) {
    if (!this.auth) {
      return;
    }
    return this.afdb.object(`/sellbooks/${uid}/soldBook/${id}`).set(JSON.stringify(book));
  }

  // sold books
  getBookSold(id) {
    if (!this.auth) {
      return;
    }
    return this.afdb.list(`/sellbooks/${id}/soldBook`).snapshotChanges(['child_added']);
  }

  // pushing a book that the user wants to sell to under the user's uid and forsale bok in firebase
  sellBook(id, book: Book) {
    if (!this.auth) {
      return;
    }

    const time = new Date;

    book.seller = this.userName;
    book.email = this.email;
    book.uid = this.userId;
    book.sold = false;
    book.time = time.getTime();
    book.id = id;

    const booksForSale = { ...book };
    const sellBook = {
      id,
      isForSale: true,
    };

    this.afdb.object(`/bookForSale/${id}`).set(booksForSale);
    return this.afdb.object(`/userBooks/${this.userId}/forSale/${id}`).set(sellBook);
  }

  // updating the book that has been bought
  updateSoldBook(bkid, uid, book: Book) {
    if (!this.auth) {
      return;
    }
    const soldBook = { ...book };
    return this.afdb.object(`/sellbooks/${uid}/forSale/${bkid}`).set(soldBook);
  }

  // saving books user bought (buid--> buyer user id)
  saveBuyBook(bkid, buyerid, book: Book) {
    if (!this.auth) {
    return;
    }
    return this.afdb.object(`/buyBooks/${buyerid}/${bkid}`).set(JSON.stringify(book));
  }

  // getting all books data under every users forsale books node in firebase to the store component
  getUserForSaleBooks() {
    if (!this.auth) {
      return;
    }
    return this.afdb.list(`userBooks/${this.userId}/forSale`).valueChanges();
  }

  getUserForSaleBook({ id }) {
    return this.afdb.list(`/bookForSale/${id}`).query
    .once('value');
  }

  getForSaleBooks() {
    return this.afdb.list(`/bookForSale`).valueChanges();
  }
  // getting all the users uids in firebase and used them to get the all the books using getForSaleBooks
  getUserIds() {
    if (!this.auth) {
      return;
    }
    return this.afdb.list(`/sellbooks`).snapshotChanges(['child_added']);
  }

  // getting one book data to the buy-book page
  getForSaleBook(id) {
    if (!this.auth) {
      return;
    }
    console.log(id);
    return this.afdb.list(`/bookForSale/${id}`).query.once('value');
  }

  // removing a particular book from the user inventory node in Firebase
  removeFromInv(id) {
    if (!this.auth) {
      return;
    }
    return this.afdb.list(`/userBooks/${this.userId}/inventory/${id}`).remove();
  }

  // removing a particular book from the user forsale node in Firebase
  removeFromStore(id) {
    if (!this.auth) {
      return;
    }
    this.afdb.list(`/bookForSale/${id}`).remove();
    return this.afdb.list(`/userBooks/${this.userId}/forSale/${id}`).remove();
  }

  getBuyerAddress(uid) {
    return this.afdb.object(`/address/${uid}`).valueChanges();
  }
  // send carrier and tracking code
  sendCarrierCode(buyerid, bkid, book) {
    if (!this.auth) {
      return;
      }
      return this.afdb.object(`/buyBooks/${buyerid}/${bkid}`).set(JSON.stringify(book));
  }

  getRegisteredUsers() {
    return this.afdb.list(`/registered/`).valueChanges();
  }
}
