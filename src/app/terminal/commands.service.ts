import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { FilesService } from '../files/files.service';
export interface CommandHistory {
  prompt: string;
  command: string;
  results: string[];
}
export interface Command {
  name: string;
  minLength: number;
  maxLength: number;
  exec: Function;
}
@Injectable({
  providedIn: 'root'
})
export class CommandsService {
  commands: Command[] = [
    {
      name: 'ls',
      minLength: 1,
      maxLength: 1,
      exec: () => {
        const files = [];
        this.filesService.myFiles$.subscribe(f => {
          files.push((f as any).name);
        });
        return files;
      }
    },
    {
      name: 'mkdir',
      minLength: 2,
      maxLength: 2,
      exec: name => {
        this.filesService.createFolder(name);
      }
    },
    {
      name: 'prompt',
      minLength: 1,
      maxLength: 2,
      exec: argv => {
        if (argv.length === 1) {
          return [this.prompt];
        }
        if (argv.length === 2) {
          this.prompt = argv[1];
          return [''];
        }
      }
    },
    {
      name: 'alert',
      minLength: 2,
      maxLength: 2,
      exec: argv => {
        alert(argv[1]);
        return ['Alerta mostrada'];
      }
    }
  ];

  history$ = new Subject<CommandHistory>();
  prompt = '/home/users/dani$';

  errors = {
    COMMAND_NOT_FOUND: 'El comando no está disponible',
    ARGC_WRONG: 'El número de parámetro es incorrecto'
  };

  constructor(private filesService: FilesService) {}

  private commandExists(command): Command {
    let c: Command;
    this.commands.map(_c => {
      if (_c.name === command) {
        c = _c;
      }
    });
    return c;
  }

  private argcOk(c: Command, argc: number): boolean {
    return c.minLength <= argc && c.maxLength >= argc;
  }

  private execCommand(argv: string[], c: Command) {
    const prompt = this.prompt;

    let results: string[];
    switch (argv[0]) {
      case 'ls':
        results = c.exec();
        break;
      case 'mkdir':
        results = c.exec(c.name);
        break;
      case 'prompt':
        results = c.exec(argv);
        break;
      case 'alert':
        results = c.exec(argv);
        break;
    }
    this.appendItemToHistory(argv, results, prompt);
  }

  private appendItemToHistory(
    argv: string[],
    results: string[],
    prompt = this.prompt
  ) {
    let command = '';
    argv.map(_c => (command += _c + ' '));
    this.history$.next({
      prompt,
      command,
      results
    });
  }

  getResultFromCommand(command) {
    const argv: string[] = command.split(' ').filter(a => a !== '');

    const c = this.commandExists(argv[0]);
    if (c === undefined) {
      this.appendItemToHistory(argv, [this.errors.COMMAND_NOT_FOUND]);
      return;
    }
    if (!this.argcOk(c, argv.length)) {
      this.appendItemToHistory(argv, [this.errors.ARGC_WRONG]);
      return;
    }
    this.execCommand(argv, c);
  }
}