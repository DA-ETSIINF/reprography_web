import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FilesService } from './files.service';
import { Item } from '../models';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {
  currentPage: string;
  status: string;
  currentSelected: Item[] = [];
  myDocumentsItems: Item[] = [];
  sharedWithMeItems: Item[] = [];
  loading: boolean;
  showMyDocumentsAside: boolean;
  showSharedDocumentsAside: boolean;
  constructor(
    private router: Router,
    private fileService: FilesService,
    public appComponent: AppComponent
  ) {
    router.events.subscribe(() => {
      this.loading = true;

      this.currentPage = this.router.routerState.snapshot.url;

      this.fileService
        .getJSON('my-documents')
        .subscribe(data => (this.myDocumentsItems = this.shortenNames(data)));

      this.fileService
        .getJSON('shared-with-me')
        .subscribe(data => (this.sharedWithMeItems = this.shortenNames(data)));
      this.loading = false;
    });
  }

  ngOnInit() {}

  getCurrentItems() {
    return this.currentPage === '/my-documents'
      ? this.myDocumentsItems
      : this.sharedWithMeItems;
  }

  goTo(page: string) {
    this.router.navigate([page]);
  }

  shortenNames(files): Item[] {
    files.map(e => {
      if (e.name.length > 13) {
        const begin = e.name.substring(0, 8);
        const end = e.name.substring(e.name.length - 5);
        e.shorten = `${begin} ... ${end}`;
      }
    });
    return files;
  }
  deselect() {
    const items = document.querySelectorAll('.selected');
    for (let i = 0; i < items.length; i++) {
      items[i].classList.remove('selected');
    }
    this.currentSelected = [];
  }
  selectOne(event) {
    if (event.target.localName === 'app-item') {
      event.target.classList.add('selected');
    } else if (event.target.className.includes('item')) {
      event.target.parentElement.classList.add('selected');
    } else {
      event.target.parentElement.parentElement.classList.add('selected');
    }
  }
  select(event, itemInfo) {
    if (!event.ctrlKey) {
      this.deselect();
    }
    this.selectOne(event);
    this.currentSelected.push(itemInfo);
  }
}
