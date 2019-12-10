import { Injectable } from '@angular/core';
import { Nickname } from './nickname';

@Injectable({
  providedIn: 'root'
})
export class NicklistService {

  constructor() { }

  public nicklist:Nickname[] = [];

  public getNicklist():Nickname[] {
    return this.nicklist;
  }
  
  public setNicklist(list:Nickname[]) {
    this.nicklist = list;
  }

}
