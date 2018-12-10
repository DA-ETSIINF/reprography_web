import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  of,
  Observable,
  Subject,
  interval,
  concat,
  ReplaySubject
} from 'rxjs';

import { FileToPrint, Folder, FolderItem } from '../models';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable({
  providedIn: 'root'
})
export class FilesService implements OnInit {
  files: Folder[] = [];
  files$ = new Subject<Folder[]>();
  showingFiles$ = new Subject<FolderItem[][]>();

  itemsInQueue$ = new BehaviorSubject<FileToPrint[]>([]);
  updateItemName$ = new Subject<FolderItem>();
  deleteItem$ = new Subject<FolderItem>();
  createFolder$ = new Subject();

  itemMenu$ = new BehaviorSubject<boolean>(false);
  dragableItem$ = new Subject<{ item: FolderItem; x: number; y: number }>();

  currentPage: string;

  randomNames: { a: string; b: string }[] = [
    { a: 'Un buen nombre sería', b: 'Asignatura chunga' },
    { a: 'Nombre', b: 'Esta vez sacaré un 10' },
    { a: '¿Y qué tal este nombre?', b: 'temp1' }
  ];

  constructor(private http: HttpClient, public router: Router, private notificationsService: NotificationsService) {
    this.fetchFiles();
  }

  ngOnInit() {}

  private appendItem(folderArr: Folder): FolderItem[] {
    if (folderArr === undefined) {
      return [];
    }
    const results: FolderItem[] = [];
    folderArr.folders.map(folder => {
      results.push({
        id: folder.id,
        name: folder.name,
        type: 'folder'
      });
    });
    folderArr.files.map(file => {
      results.push({
        id: file.id,
        name: file.name,
        shorten: file.shorten,
        type: file.type,
        link: file.link
      });
    });
    return results;
  }

  findFolder(id: number, i: number): Folder {
    if (id === -1) {
      return this.files[i];
    }
    return this.findFolderRecursion(id, this.files);
  }

  private findFolderRecursion(id: number, folder: Folder[]): Folder {
    folder.forEach(f => {
      if (f.id === id) {
        return f;
      }
    });

    folder.forEach(f => {
      if (f.id === id) {
        return this.findFolderRecursion(id, f.folders);
      }
    });
    return undefined;
  }

  updateShowing(id: number, type: 'myFiles' | 'sharedWithMe'): FolderItem[] {
    const i = (type === 'myFiles') ? 0 : 1;
    let folderArr: Folder;
    folderArr = this.findFolder(id, i);
    return this.appendItem(folderArr);
  }

  private handleData(data: Folder[]): Folder[] {
    data.map(_ => {
      _.files.map(file => {
        file.type = file.name.split('.').pop();
        file.name = file.name.substr(0, file.name.length - 4);
        if (file.name.length > 19) {
          const begin = file.name.substring(0, 13);
          const end = file.name.substring(file.name.length - 5);
          file.shorten = `${begin} ... ${end}`;
        }
      });
    });
    return data;
  }

  fetchFiles() {
    this.http
      .get(`${environment.server}:${environment.port}/print/files`)
      .subscribe(data => {
        data = this.handleData(data  as Folder[]);
        this.files = data as Folder[];
        this.files$.next(this.files);
        this.showingFiles$.next([this.updateShowing(-1, 'myFiles'), []]);
        // this.updateShowing(-1, 'sharedWithMe');
      },
      () => {
        this.notificationsService.addNotification({
          title: 'No se ha podido conectar con la API',
          status: 'error'
        });
      });
  }

  triggerUpload() {
    const fileInput = <HTMLInputElement>document.getElementById('uploadInput');
    fileInput.click();
  }

  uploadChange(files: FileList) {
    const files$ = [];
    let fd;
    Array.from(files).map(file => {
      fd = new FormData();
      fd.set('file', files[0]);
      fd.set('folder', 1);
      files$.push(of(fd));
    });
    concat(...files$).subscribe(fileData => {
      this.http
        .post(
          `${environment.server}:${environment.port}/print/upload/`,
          fileData
        )
        .subscribe(res => {});
    });
  }

  deleteItem(item: FolderItem) {
    console.log('Eliminar', item);
  }

  printFiles(files: FileToPrint[]) {
    console.log(files[0]);
    this.http
      .post(
        `${environment.server}:${environment.port}/print/send-to-printer/`,
        files[0]
      )
      .subscribe(res => {
        console.log(res);
        this.notificationsService.addNotification({
          title: 'Enviada la petición',
          status: 'ok',
          description: 'Ahora la carga de trabajo está en el backend y la impresora. Cruza los dedos.'});
      });
    if (files[0].ncopies > 1) {
      files[0].ncopies --;
      this.printFiles(files);
    }
    if (files.length > 1) {
      this.printFiles(files.slice(1));
    }
  }

  addFileToQueue(documentId: number, name: string, npages: number) {
    let b: FileToPrint[];
    this.itemsInQueue$.subscribe(a => (b = a)).unsubscribe();
    b.push({ documentId, name, npages, doubleSided: true, ncopies: 1 });
    this.itemsInQueue$.next(b);
  }

  createFolder(name: string) {
    console.log(name);
  }

  getRandomName(): string {
    const a = [];
    const b = [];
    this.randomNames.map(c => {
      a.push(c.a);
      b.push(c.b);
    });
    return `${a[Math.floor(Math.random() * this.randomNames.length)]}: ${
      b[Math.floor(Math.random() * this.randomNames.length)]
    }`;
  }
}
